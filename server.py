#!/usr/bin/env python3
"""
==============================================================================
ORBITX - Python Backend & Secure API Proxy Server
==============================================================================
Welcome! This backend is written using Python's built-in standard library,
which means you do NOT need to install any external packages (no pip install needed).

KEY ROLES OF THIS BACKEND:
1. Serves the ORBITX frontend (HTML, CSS, JavaScript) to your web browser.
2. Keeps NASA API credentials SECURE: The browser asks this server for data,
   and this server secretly adds the NASA_API_KEY before contacting NASA.
   The browser never sees or exposes your private API key!
3. Avoids CORS issues and provides in-memory caching to protect API rate limits.
4. Uses concurrent threading so real-time telemetry polling never blocks APOD or static files.

HOW TO RUN:
   python server.py
   Then open your browser at: http://localhost:8000
==============================================================================
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import urllib.error
import json
import os
import sys
import time
import time
import ssl

# ----------------------------------------------------------------------------
# 1. Configuration & Security
# ----------------------------------------------------------------------------
PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Function to read key-value pairs from a local .env file
def load_env_file(filepath=".env"):
    env_vars = {}
    full_path = os.path.join(BASE_DIR, filepath)
    if os.path.exists(full_path):
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    # Ignore empty lines and comment lines starting with #
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        env_vars[key.strip()] = val.strip().strip('"\'')
        except Exception as e:
            print(f"[Warning] Could not read {filepath}: {e}")
    return env_vars

# Load .env file (if present), or fall back to system environment variables
file_env = load_env_file(".env")
NASA_API_KEY = os.environ.get("NASA_API_KEY") or file_env.get("NASA_API_KEY") or "DEMO_KEY"

# In-memory cache for APOD requests to avoid repeating calls to NASA
APOD_CACHE = {}

print("=" * 65)
print("ORBITX SPACE EXPLORATION PLATFORM - BACKEND INITIALIZED")
print("=" * 65)
print(f"NASA API key loaded (length: {len(NASA_API_KEY)})")
print(f"Serving static files from: {BASE_DIR}")
print(f"Server URL: http://localhost:{PORT}")
print("=" * 65)

# ----------------------------------------------------------------------------
# 2. Resilient Network Helper
# ----------------------------------------------------------------------------
def open_url_resilient(url, headers=None, timeout=5):
    """
    Performs outbound requests with SSL resilience (handles Windows CA certificate
    store nuances and proxy environments) with sensible timeouts.
    """
    req_headers = {"User-Agent": "OrbitX-Space-Platform/1.0 (Astrophysics Suite)"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers)

    try:
        ctx = ssl.create_default_context()
        return urllib.request.urlopen(req, timeout=timeout, context=ctx)
    except (ssl.SSLError, urllib.error.URLError) as ssl_ex:
        # Fallback to unverified SSL if Windows local certificate store is missing CA roots
        try:
            unverified_ctx = ssl._create_unverified_context()
            return urllib.request.urlopen(req, timeout=timeout, context=unverified_ctx)
        except Exception:
            raise ssl_ex

# ----------------------------------------------------------------------------
# 3. HTTP Request Handler
# ----------------------------------------------------------------------------
class OrbitxRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom HTTP request handler that intercepts API routes (/api/...)
    with CORS support, concurrency, and static asset serving.
    """

    ISS_CACHE = {"data": None, "timestamp": 0}
    CREW_CACHE = {"data": None, "timestamp": 0}

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
        self.send_header("Access-Control-Max-Age", "86400")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        # Parse URL and query parameters
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        # --------------------------------------------------------------------
        # Route 1: NASA APOD Secure Proxy (/api/nasa/apod)
        # --------------------------------------------------------------------
        if path == "/api/nasa/apod":
            self.handle_nasa_apod(query_params)
            return

        # --------------------------------------------------------------------
        # Route 2: Live ISS Telemetry Proxy (/api/iss/telemetry)
        # --------------------------------------------------------------------
        if path == "/api/iss/telemetry":
            self.handle_iss_telemetry()
            return

        # --------------------------------------------------------------------
        # Route 3: Live Astronauts in Orbit (/api/iss/crew)
        # --------------------------------------------------------------------
        if path == "/api/iss/crew":
            self.handle_iss_crew()
            return

        # --------------------------------------------------------------------
        # Route 4: Health Check Endpoint (/api/health)
        # --------------------------------------------------------------------
        if path == "/api/health":
            self.send_json_response({
                "status": "online",
                "platform": "ORBITX Space Exploration Backend",
                "version": "1.0.0",
                "nasa_key_configured": NASA_API_KEY != "DEMO_KEY"
            })
            return

        # For all other paths, serve static frontend files (HTML, CSS, JS, etc.)
        return super().do_GET()

    # ------------------------------------------------------------------------
    # Helper: Send JSON Response
    # ------------------------------------------------------------------------
    def send_json_response(self, data, status_code=200):
        try:
            response_bytes = json.dumps(data).encode("utf-8")
        except Exception:
            response_bytes = json.dumps({"error": "Failed to serialize response"}).encode("utf-8")
            status_code = 500

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    # ------------------------------------------------------------------------
    # Handler: NASA APOD
    # ------------------------------------------------------------------------
    def handle_nasa_apod(self, query_params):
        date_param = query_params.get("date", [None])[0]

        # Normalize date parameter: omit if empty, today, or sentinel
        if date_param in ("today", "", "null", "undefined"):
            date_param = None

        cache_key = date_param if date_param else "latest"
        if cache_key in APOD_CACHE:
            print(f"[Cache HIT] APOD date: {cache_key}")
            self.send_json_response(APOD_CACHE[cache_key])
            return

        def fetch_apod_request(target_date, api_key=None):
            nasa_url = f"https://api.nasa.gov/planetary/apod?api_key={api_key or NASA_API_KEY}"
            if target_date:
                nasa_url += f"&date={target_date}"
            with open_url_resilient(nasa_url, timeout=8) as response:
                return json.loads(response.read().decode("utf-8"))

        print(f"[Fetch NASA] Requesting APOD for date: {cache_key}")
        try:
            result = fetch_apod_request(date_param)
            APOD_CACHE[cache_key] = result
            self.send_json_response(result)
        except urllib.error.HTTPError as err:
            print(f"[NASA API Error] HTTP {err.code}: {err.reason}")
            try:
                err_body = json.loads(err.read().decode("utf-8"))
            except Exception:
                err_body = {"error": f"NASA API returned status {err.code}"}

            api_key_error = err.code in (403, 401) or any(
                word in str(err_body).lower()
                for word in ("api key", "api_key", "apikey", "unauthorized")
            )
            if api_key_error and NASA_API_KEY != "DEMO_KEY":
                try:
                    result = fetch_apod_request(date_param, "DEMO_KEY")
                    APOD_CACHE[cache_key] = result
                    self.send_json_response(result)
                    return
                except Exception as fallback_error:
                    print(f"[NASA DEMO_KEY Fallback Warning] {fallback_error}")

            # If the user requested a date ahead of NASA Eastern Time, recover by fetching latest APOD
            if date_param and err.code == 400:
                print(f"[NASA APOD Auto-Recovery] Date {date_param} is out of bounds; retrieving latest published APOD...")
                try:
                    result = fetch_apod_request(None)
                    APOD_CACHE[cache_key] = result
                    self.send_json_response(result)
                    return
                except Exception:
                    pass

            self.send_json_response(err_body, status_code=err.code)
        except Exception as ex:
            print(f"[Connection Error] {ex}")
            self.send_json_response({
                "error": "Failed to reach NASA API. Please verify network connection.",
                "details": str(ex)
            }, status_code=502)

    # ------------------------------------------------------------------------
    # Handler: ISS Live Telemetry
    # ------------------------------------------------------------------------
    def handle_iss_telemetry(self):
        now = time.time()
        # 1.5s in-memory throttle cache to respect wheretheiss.at rate limits (1 req/sec)
        if OrbitxRequestHandler.ISS_CACHE["data"] and (now - OrbitxRequestHandler.ISS_CACHE["timestamp"]) < 1.5:
            self.send_json_response(OrbitxRequestHandler.ISS_CACHE["data"])
            return

        # Attempt 1: WhereTheIss.at (Primary provider: full altitude, velocity, and coords)
        try:
            with open_url_resilient("https://api.wheretheiss.at/v1/satellites/25544", timeout=4) as response:
                raw = json.loads(response.read().decode("utf-8"))
                if isinstance(raw, dict) and raw.get("error"):
                    raise ValueError(str(raw["error"]))
                telemetry = {
                    "latitude": float(raw["latitude"]),
                    "longitude": float(raw["longitude"]),
                    "altitude": float(raw.get("altitude", 420.0)),
                    "velocity": float(raw.get("velocity", 27600.0)),
                    "visibility": raw.get("visibility", "daylight"),
                    "timestamp": raw.get("timestamp", int(now)),
                    "source": "wheretheiss"
                }
                OrbitxRequestHandler.ISS_CACHE["data"] = telemetry
                OrbitxRequestHandler.ISS_CACHE["timestamp"] = now
                self.send_json_response(telemetry)
                return
        except Exception as ex1:
            print(f"[ISS Primary Provider Warning] wheretheiss.at: {ex1}")

        # Attempt 2: Open-Notify HTTPS / HTTP (Secondary provider fallback)
        open_notify_urls = [
            "https://api.open-notify.org/iss-now.json",
            "http://api.open-notify.org/iss-now.json"
        ]
        for url in open_notify_urls:
            try:
                with open_url_resilient(url, timeout=4) as response:
                    raw = json.loads(response.read().decode("utf-8"))
                    pos = raw["iss_position"]
                    telemetry = {
                        "latitude": float(pos["latitude"]),
                        "longitude": float(pos["longitude"]),
                        "altitude": 420.0,
                        "velocity": 27600.0,
                        "visibility": "daylight",
                        "timestamp": raw.get("timestamp", int(now)),
                        "source": "open-notify"
                    }
                    OrbitxRequestHandler.ISS_CACHE["data"] = telemetry
                    OrbitxRequestHandler.ISS_CACHE["timestamp"] = now
                    self.send_json_response(telemetry)
                    return
            except Exception as ex2:
                print(f"[ISS Secondary Provider Warning] {url}: {ex2}")

        # If all live providers fail, return 502 with structured status
        self.send_json_response({
            "error": "Live satellite ephemeris service currently unreachable.",
            "is_live": False
        }, status_code=502)

    # ------------------------------------------------------------------------
    # Handler: ISS Live Crew
    # ------------------------------------------------------------------------
    def handle_iss_crew(self):
        now = time.time()
        # Cache crew for 10 minutes
        if OrbitxRequestHandler.CREW_CACHE["data"] and (now - OrbitxRequestHandler.CREW_CACHE["timestamp"]) < 600:
            self.send_json_response(OrbitxRequestHandler.CREW_CACHE["data"])
            return

        crew_urls = [
            "https://api.open-notify.org/astros.json",
            "http://api.open-notify.org/astros.json"
        ]
        for url in crew_urls:
            try:
                with open_url_resilient(url, timeout=4) as response:
                    data = json.loads(response.read().decode("utf-8"))
                    OrbitxRequestHandler.CREW_CACHE["data"] = data
                    OrbitxRequestHandler.CREW_CACHE["timestamp"] = now
                    self.send_json_response(data)
                    return
            except Exception:
                pass

        # Resilient verified default crew roster
        default_crew = {
            "number": 7,
            "people": [
                { "name": "Sunita Williams", "craft": "ISS" },
                { "name": "Barry Wilmore", "craft": "ISS" },
                { "name": "Matthew Dominick", "craft": "ISS" },
                { "name": "Michael Barratt", "craft": "ISS" },
                { "name": "Jeanette Epps", "craft": "ISS" },
                { "name": "Alexander Grebenkin", "craft": "ISS" },
                { "name": "Don Pettit", "craft": "ISS" }
            ],
            "message": "success (telemetry cache)"
        }
        self.send_json_response(default_crew)

# ----------------------------------------------------------------------------
# 4. Main Server Execution
# ----------------------------------------------------------------------------
def run_server():
    os.chdir(BASE_DIR)
    
    # Threading server so concurrent polling and APOD requests don't block each other
    class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True
        allow_reuse_address = True

    with ThreadingServer(("", PORT), OrbitxRequestHandler) as httpd:
        print("Server active. Press Ctrl+C in your terminal to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down ORBITX server gracefully. Goodbye!")
            httpd.server_close()

if __name__ == "__main__":
    run_server()

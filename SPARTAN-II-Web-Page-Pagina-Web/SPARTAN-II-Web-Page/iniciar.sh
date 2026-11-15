#!/bin/sh
(sleep 1; (xdg-open http://localhost:5500 || open http://localhost:5500) >/dev/null 2>&1) &
python3 -m http.server 5500

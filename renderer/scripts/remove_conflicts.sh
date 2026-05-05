#!/bin/bash
# Remove all merge conflict markers - keep HEAD version only
awk '
/^<<<<<<< HEAD/ { in_conflict=1; skip=0; next }
/^=======/ { if(in_conflict) { skip=1; next } }
/^>>>>>>>/ { if(in_conflict) { in_conflict=0; skip=0; next } }
!skip { print }
' app.js > app.js.clean && mv app.js.clean app.js
echo "All conflict markers removed!"

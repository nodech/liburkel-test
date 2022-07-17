#!/bin/sh

echo "Applying patches..."
for f in `cat patches/.patches`
do
  echo "Applying $f..."
  patch -p1 -N -s < patches/$f
done

#!/bin/bash

if [ ! -d "kango" ]; then
  mkdir kango
  curl http://kangoextensions.com/kango/kango-framework-latest.zip > kango/kango.zip
  cd kango
  unzip kango.zip
  cd ..
fi

python kango/kango.py build .


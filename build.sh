./external/google-closure-library/closure/bin/calcdeps.py \
    -i ./build/config-node.js -i ./build/preprocesed-qp.js -i ./build/preprocesed.js \
    -d ./external/google-closure-library -o compiled \
    -c node_modules/closure-compiler/lib/vendor/compiler.jar \
    --output_file=build/foo.js \
    -f "--use_types_for_optimization" \
    -f "--summary_detail_level" -f "3" \
    -f "--warning_level" -f "VERBOSE" \
    -f "--jscomp_off" -f "checkVars" \
    -f "--compilation_level" -f "ADVANCED_OPTIMIZATIONS"


module.exports = {
    entry: "./src/greeter.ts",
    output: {
        filename: "bundle.js"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
}

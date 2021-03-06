const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = (_, options) => {
	const isProduction = (options.mode === 'production');
	const homepage = process.env.PUBLIC_URL ?? (require('./package.json').homepage || '');
	const publicUrl = isProduction ? homepage : '';
	const commit = process.env.COMMIT?.slice(0, 8);

	return {
		entry: './src/index.tsx',
		resolve: {
			extensions: [
				'.js',
				'.jsx',
				'.ts',
				'.tsx',
			],
		},
		devServer: {
			contentBase: '/src/App/public',
			historyApiFallback: true,
			port: 8000,
			host: '0.0.0.0',
		},
		devtool: 'source-map',
		output: {
			filename: 'index.js',
			publicPath: `${publicUrl}/`,
			path: `${__dirname}/build`, // eslint-disable-line no-undef
		},
		module: {
			rules: [
				{
					test: /\.ts(x?)$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'ts-loader'
						}
					]
				},
				{
					enforce: 'pre',
					test: /\.js$/,
					loader: 'source-map-loader'
				},
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: [{
						loader: 'babel-loader',
						options: { presets: ['@babel/react', '@babel/env'] },
					}],
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader'],
				},
			],
		},
		plugins: [
			new CopyWebpackPlugin({
				patterns: [
					{ from: 'src/App/public', filter: path => !path.endsWith('.html'), },
				],
			}),
			new HtmlWebpackPlugin({
				template: 'src/App/public/index.html',
				inject: 'body',
				publicUrl: publicUrl
			}),
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoEmitOnErrorsPlugin(),
			new GenerateSW(),
			new webpack.DefinePlugin({
				'process.env': {
					PUBLIC_URL: JSON.stringify(publicUrl),
					COMMIT: JSON.stringify(commit),
				},
			}),
		],
	};
};

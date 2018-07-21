import * as path from 'path';

const rel = (x: string) => path.resolve(__dirname, x);

const config: any = {
  mode: 'development',
  entry: {
    'main/App': './src/main/front-end/App.bundle.ts',
  },
  output: {
    path: rel('./build'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      rel('./src/main/front-end'),
      rel('./src/main/back-end'),
      rel('./node_modules'),
    ],
  },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.ts/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              silent: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      // { test: /zone\.js$/, loader: 'script-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      { test: /\.component.less$/, loaders: ['raw-loader', 'less-loader'] },
      { test: /^(?!.*component\.less$).*\.less$/, loader: 'style-loader!css-loader!less-loader' },
      { test: /\.html$/, loader: 'raw-loader' },
      {
        test: /node_modules\/.*\.(jpe?g|png|gif|svg|swf)$/i,
        use: {
          loader: 'file-loader',
          options: {
            regExp: 'node_modules/(.*)',
            name: 'assets/[1]',
          },
        },
      },
      {
        test: /src\/app\/.*\.(jpe?g|png|gif|svg|swf)$/i,
        use: {
          loader: 'file-loader',
          options: {
            regExp: 'src/app/(.*)',
            name: 'dist/[1]',
          },
        },
      },
    ],
  },
  plugins: [],
  devtool: 'source-map',
};


export = config;

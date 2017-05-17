'use strict';

import fs from 'fs';

import gulp from 'gulp';
import gif from 'gulp-if';
import rename from 'gulp-rename';
import tap from 'gulp-tap';
import unretina from 'gulp-unretina';
import newer from 'gulp-newer';
import sass from 'gulp-sass';
import imagemin from 'gulp-imagemin';
import htmlmin from 'gulp-htmlmin';
import uglify from 'gulp-uglify';
import gdata from 'gulp-data';

import babelify from 'babelify';
import watchify from 'watchify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import gutil from 'gulp-util';

import handlebars from 'gulp-compile-handlebars';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';

import bs from 'browser-sync';

const site = {
  title: 'Northplay',
  description: 'Makers from Copenhagen',
  keywords: 'north,play,games,ios,tvos,apple,tv,development,copenhagen,denmark',
  url: 'http://northplay.co',
  fb: {
    appName: '',
    appId: ''
  }
};

const config = {
  build: './build',
  paths: {
    html: 'index.handlebars',
    partials: './assets/templates/**/*.handlebars',
    images: './assets/images/**/*.{png,jpg,gif,svg}',
    sass: './assets/sass/**/*.{scss,sass}',
    js: './assets/js/main.js',
    videos: './assets/videos/*.{webm,mp4,mov,ogv}',
    favicon: './assets/favicon/*{.png,jpg,svg}',
    copyfiles: ['manifest.json','browserconfig.xml','favicon.ico','./assets/audio/*.mp3'],
    data: './assets/data/**/*.json',
    pages: './assets/pages/*.handlebars'
  },
  production: false,
  watching: false,
  retina_suffix: '_2x'
};

function configure_bundler() {
  let bundler = null;

  const browserify_opts = {
    entries: ['./assets/js/main.js'],
    debug: true
  };

  if (config.watching) {
    watchify.args.debug = true;
    bundler = watchify(browserify(browserify_opts, watchify.args));
  } else {
    bundler = browserify(browserify_opts);
  }

  let rebundle = () => {
    bundle(bundler);
  };

  bundler.on('update', () => {
    gutil.log('Rebundling');
    rebundle();
  });

  rebundle();
}

function bundle(bundler) {
  gutil.log('Bundling javascript');

  return bundler.bundle()
    .on('error', function(err) {
      gutil.log(err.message);
      browserSync.notify('Bundle error!');
      this.emit('end');
    })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(gif(config.production, uglify()))
    .pipe(rename('bundle.js'))
    .pipe(sourcemaps.write('./maps', {includeContent: true, sourceRoot: './assets/js'}))
    .pipe(gulp.dest(`${config.build}/js/`))
    .pipe(gif(config.watching, browserSync.stream({once: true})));
}

const browserSync = bs.create();

function retina_path(path) {
  const components = path.split('.');
  return `${components[0]}_2x.${components[1]}`
}

function unretina_path(path) {
  const components = path.split(config.retina_suffix);
  return `${components[0]}${components[1]}`;
}

function file_exists(path) {
  return !path.match(`\n`) && fs.existsSync(path);
}

function load_partial(name) {
  const path = `./assets/templates/${name}.handlebars`;

  if(file_exists(path)) {
    return fs.readFileSync(path, 'utf8');
  }

  return null;
}

function read_data(name) {
  const path = `./assets/data/${name}.json`;

  if (file_exists(path)) {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  }

  return null;
}

function image_helper(path, cls = null, alt = "", has_retina = true) {
  const retina = retina_path(path);
  var str = `<img src="/images/${path}"`;
  if (retina) {
    str += ` data-at2x="/images/${retina}"`;
  }
  if (typeof cls === 'string') {
    str += ` class="${cls}"`;
  }
  if (typeof alt === 'string' && alt != "") {
    str += ` alt="${alt}"`;
  }
  str += ">";

  return str;
}

gulp.task('sass', () => {
  const options = {
    imagePath: '/images',
    includePaths: [
      './node_modules/normalize.css',
      './node_modules/ladda/css'
    ]
  };

  if (config.production) {
    options.outputStyle = 'compressed';
    options.sourceComments = false;
  }

  return gulp.src(config.paths.sass)
    .pipe(sourcemaps.init())
    .pipe(sass(options))
    .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
    .pipe(sourcemaps.write('./maps', {includeContent: true, sourceRoot: './assets/sass'}))
    .pipe(gulp.dest(`${config.build}/css`))
    .pipe(gif(config.watching, browserSync.stream({match: '**/*.css'})));
});

gulp.task('imagecopy', () => {
  return gulp.src([config.paths.images, `!*${config.retina_suffix}.{png,jpg,gif,svg}`])
    .pipe(imagemin())
    .pipe(gulp.dest(`${config.build}/images`));
});

gulp.task('videos', () => {
  return gulp.src(config.paths.videos)
    .pipe(gulp.dest(`${config.build}/videos`));
});

gulp.task('favicon', () => {
  return gulp.src(config.paths.favicon)
    .pipe(gulp.dest(`${config.build}/favicon`))
})

gulp.task('copyfiles', () => {
  return gulp.src(config.paths.copyfiles)
    .pipe(gulp.dest(config.build))
})

gulp.task('unretina', () => {
  const dest = `${config.build}/images`;

  return gulp.src(`./assets/images/**/*${config.retina_suffix}.{png,jpg,gif}`)
    .pipe(newer({
      dest: dest,
      map: unretina_path
    }))
    .pipe(unretina({suffix: config.retina_suffix}))
    .pipe(imagemin())
    .pipe(gulp.dest(dest));
});

gulp.task('images', ['imagecopy', 'unretina']);

gulp.task('subpages', () => {
  const products = read_data('products');

  let options = {
    ignorePartials: true,
    partials: {
      get header() { return load_partial('header') },
      get footer() { return load_partial('footer') },
      get newsletter() { return load_partial('newsletter') },
      get product() { return load_partial('product') },
      get details() { return load_partial('details') },
      get navigation() { return load_partial('navigation') },
      get greenlight() { return load_partial('greenlight') },
      get needateam() { return load_partial('needateam') }
    },
    helpers: {
      img: (path, cls = null, has_retina = true) => image_helper(path, cls, has_retina)
    }
  };

  let minOptions = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyURLs: true,
    minifyJS: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true
  };

  return gulp.src(config.paths.pages)
    .pipe(gdata((file) => {
      const id = file.path.replace('.handlebars', '').split('/').pop();
      const product = products.filter((p) => p.id == id).pop();
      let data = {
        site: site,
        config: config,
        title: product.name,
        data: {
          product: product
        }
      };

    data.site.description = product.description;

      return data;
    }))
    .pipe(handlebars({}, options))
    .pipe(rename((path) => {
      path.dirname += `/${path.basename}`;
      path.basename = 'index';
      path.extname = '.html';
    }))
    .pipe(gif(config.production, htmlmin(minOptions)))
    .pipe(gulp.dest(config.build))
    .pipe(gif(config.watching, browserSync.stream()));
});

gulp.task('index', () => {
  const data = {
    config: config,
    site: site,
    data: {
      products: read_data('products')
    }
  };

  let options = {
    ignorePartials: true,
    partials: {
      get header() { return load_partial('header') },
      get footer() { return load_partial('footer') },
      get newsletter() { return load_partial('newsletter') },
      get navigation() { return load_partial('navigation') }
    },
    helpers: {
      img: (path, cls = null, has_retina = true) => image_helper(path, cls, has_retina)
    }
  };

  let minOptions = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyURLs: true,
    minifyJS: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true
  };

  return gulp.src(config.paths.html)
    .pipe(handlebars(data, options))
    .pipe(rename({extname: '.html'}))
    .pipe(gif(config.production, htmlmin(minOptions)))
    .pipe(gulp.dest(config.build))
    .pipe(gif(config.watching, browserSync.stream()));
});

gulp.task('html', ['index', 'subpages']);

gulp.task('sync', () => {
  browserSync.init({
    server: {
      baseDir: config.build
    },
    open: false
  });
});

gulp.task('set-production', () => {
  config.production = true;
});

gulp.task('bundle', () => {
  return configure_bundler();
});

gulp.task('build', ['html', 'images', 'videos', 'favicon', 'copyfiles', 'sass', 'bundle']);
gulp.task('production', ['set-production', 'build'])

gulp.task('watch', ['build', 'sync'], () => {
  config.watching = true;
  configure_bundler();

  gulp.watch(config.paths.html, ['html']);
  gulp.watch(config.paths.partials, ['html']);
  gulp.watch(config.paths.pages, ['subpages']);
  gulp.watch(config.paths.images, ['images']);
  gulp.watch(config.paths.sass, ['sass']);
  gulp.watch(config.paths.videos, ['videos']);
  gulp.watch(config.paths.favicon, ['favicon']);
  gulp.watch(config.paths.copyfiles, ['copyfiles']);
  gulp.watch(config.paths.data, ['sass', 'html']);
});

gulp.task('default', ['build', 'watch']);

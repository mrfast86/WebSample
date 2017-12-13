var isPublic = typeof window != "undefined";

/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function(global) {
    // map tells the System loader where to look for things
    var map = {
        'app':                        'client', // 'dist',
        '@angular':                   (isPublic)? '@angular' : 'node_modules/@angular',
        '@angular/router':            (isPublic)? '@angular/router' : 'node_modules/@angular/router',
        '@angular/http':              (isPublic)? '@angular/http' : 'node_modules/@angular/http',
        'rxjs':                       (isPublic)? 'rxjs' : 'node_modules/rxjs',
        'ng2-translate':              (isPublic)? 'ng2-translate' : 'node_modules/ng2-translate',
        'ng2-dropdown':               (isPublic)? 'ng2-dropdown' : 'node_modules/ng2-dropdown',
        'ng2-file-upload':            (isPublic)? 'ng2-file-upload' : 'node_modules/ng2-file-upload',
        'aws-sdk':                    (isPublic)? 'aws-sdk' : 'node_modules/aws-sdk',
        'clipboard':                    (isPublic)? 'clipboard' : 'node_modules/clipboard',
        'angular2-clipboard':         (isPublic)? 'angular2-clipboard' : 'node_modules/angular2-clipboard'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app':                        { main: 'main.js',  defaultExtension: 'js' },
        'rxjs':                       { defaultExtension: 'js' },
        'ng2-translate':              { main: 'ng2-translate.js', defaultExtension: 'js' },
        '@angular/router':            { main: 'index.js', defaultExtension: 'js' },
        'ng2-dropdown':               { main: 'index.js', defaultExtension: 'js' },
        'ng2-file-upload':            { main: 'ng2-file-upload.js', defaultExtension: 'js'},
        'aws-sdk':                    { main: 'dist/aws-sdk.js', defaultExtension: 'js'},
        'clipboard':            { main: 'dist/clipboard.js', defaultExtension: 'js' },
        'angular2-clipboard':       { main: 'index.js', defaultExtension: 'js' }
    };
    var ngPackageNames = [
        'common',
        'compiler',
        'core',
        'http',
        'forms',
        'platform-browser',
        'platform-browser-dynamic',
        'router-deprecated',
        'upgrade'
    ];
    // Individual files (~300 requests):
    function packIndex(pkgName) {
        packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
    }
    // Bundled (~40 requests):
    function packUmd(pkgName) {
        packages['@angular/'+pkgName] = { main: '/bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
    }

    // Most environments should use UMD; some (Karma) need the individual index files
    var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
    // Add package entries for angular packages
    ngPackageNames.forEach(setPackageConfig);
    var config = {
        map: map,
        packages: packages
    };
    System.config(config);
})(this);

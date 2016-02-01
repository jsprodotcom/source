var path = require('path');

module.exports = function(grunt) {
    grunt.initConfig({
        express:{
            dev: {
                options: {
                    server: path.resolve('./server'),
                    port:3000,
                    hostname:'*'
                }
            }
        },
        requirejs: {
            options: {
                paths: {
                    'appFiles': './app'
                },
                removeCombined: true,
                out: './app/requirejs/appIdeas-combined.js',
                optimize: 'none',
                name: 'main'
            },
            dev:{
                options:{
                    optimize:'none'
                }
            },
            release:{
                options:{
                    optimize:'uglify'
                }
              }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-express');

    grunt.registerTask('dev',['requirejs:dev','express:dev','express-keepalive']);
    grunt.registerTask('release',['requirejs:release','express:dev','express-keepalive']);
};
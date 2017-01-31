module.exports = function(grunt) {
    grunt.initConfig({
       pkg: grunt.file.readJSON('package.json'),

        uglify: {
            "my_target": {
                files: {
                    'public/lib/dest/nari.min.js': ['public/js/socket.io.js', 'public/js/cmiRTC.js','public/js/cmiChannel.js']

                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);
}

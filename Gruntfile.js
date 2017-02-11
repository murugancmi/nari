module.exports = function(grunt) {
    grunt.initConfig({
       pkg: grunt.file.readJSON('package.json'),

        uglify: {
            "my_target": {
                files: {
                    'src/nari.min.js': ['src/socket.io.js', 'src/cmiRTC.js','src/cmiChannel.js']

                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);
}

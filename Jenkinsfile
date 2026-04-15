pipeline {
    agent any

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/PadmapriyaaMA/weather_devops.git'
            }
        }

        stage('Build') {
            steps {
                echo 'Building project...'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying project...'
            }
        }
    }
}
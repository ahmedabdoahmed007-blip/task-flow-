pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        APP_NAME     = 'taskflow'
    }

    stages {

        stage('Checkout') {
            steps {
                echo ' Fetching source code...'
                checkout scm
            }
        }

        stage('Cleanup') {
            steps {
                echo '🧹 Cleaning up old containers...'
                sh '''
                    docker-compose -f ${COMPOSE_FILE} down --remove-orphans 2>/dev/null || true
                    docker rm -f taskflow-frontend taskflow-api taskflow-mysql 2>/dev/null || true
                '''
            }
        }

        stage('Build Images') {
            steps {
                echo ' Building Docker images...'
                sh 'docker-compose -f ${COMPOSE_FILE} build'
            }
        }

        stage('Deploy') {
            steps {
                echo ' Starting containers...'
                sh 'docker-compose -f ${COMPOSE_FILE} up -d'
            }
        }

        stage('Health Check') {
            steps {
                echo ' Verifying that the application is running...'
                sh '''
                    sleep 10
                    docker-compose -f ${COMPOSE_FILE} ps
                    docker ps | grep taskflow
                '''
            }
        }

    }

    post {
        success {
            echo " Build #${BUILD_NUMBER} succeeded! Application is running."
        }
        failure {
            echo " Build #${BUILD_NUMBER} failed!"
        }
        always {
            echo ' Stopping containers...'
            sh 'docker-compose -f ${COMPOSE_FILE} down 2>/dev/null || true'
        }
    }
}
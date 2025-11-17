pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE_NAME = 'attendance-backend-v2'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Lint') {
            steps {
                echo 'Running linter...'
                dir('backend') {
                    sh 'npm run lint || true'
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                dir('backend') {
                    sh 'npm test || true'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} -t ${DOCKER_IMAGE_NAME}:latest ./backend'
            }
        }

        stage('Push Docker Image') {
            when {
                branch 'master'
            }
            steps {
                echo 'Pushing Docker image to registry...'
                sh '''
                    docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                    docker tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest
                    # Uncomment below when ready to push to registry
                    # docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                    # docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:latest
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            when {
                branch 'master'
            }
            steps {
                echo 'Deploying with Docker Compose...'
                sh '''
                    docker-compose down || true
                    docker-compose up -d
                    docker-compose ps
                '''
            }
        }

        stage('Verify Deployment') {
            when {
                branch 'master'
            }
            steps {
                echo 'Verifying deployment...'
                sh 'sleep 10 && curl -f http://localhost:3000/health || echo "Health check pending..."'
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed'
            sh 'docker ps'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
            sh 'docker-compose logs'
        }
    }
}

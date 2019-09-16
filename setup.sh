# Setupscript to pull, build and deploy a Dockerized app straight from github
# Requires GIT and Docker to be installed on the host-system
# By Jan Macenka (2019-07-19)

# Specify your project-parameters
PROJECT_GIT=jmacenka/node-small-chat # Specify the github-path to the project e.g. user/project will lead to https://github.com/user/project.git
PROJECT_PORT=3000 # Speficy which port of the project shal be exposed to port 80

# Check if app folder already exists, if so just rebuild and redeploy the container
if [ -e ./.git ]; then
    echo "Now: Repository already locally cloned, stoping all running containers"
    docker rm -f $(docker ps -aq)
else
    echo "Now: Pulling project from github"
    git clone https://github.com/$PROJECT_GIT.git app && cd app
fi
echo "Now: Building the docker image and starting a container"
docker build -t app:latest .
docker run -d -p 80:$PROJECT_PORT --restart always --name app app
echo "All Done, Container is up and running. Visite http://$(hostname -I | cut -d' ' -f1)"

## Project 4 - Cloud Developer Nanodegree

Notes:

Provided AWS educate account that comes with the Nanodegree course does not have sufficient privileges to run Kubernetes cluster using Amazon eksctl. Due to this situation I was forced to install and run Virtual machine instance on AWS to run Kubernetes cluster.
Machine has installed Ubuntu 18.04 LTS 64-bit and is running MicroK8s Kubernetes that was installed through Snap store (edge release).
Udacity's Kubernetes configs are outdated and modifications to the k8s deployment configs were required:

- replacement of apiVersion "extensions/v1beta1" with apps/v1
- adding additional selectors
- lowering replication factor for each service to 1 in order to run cluster efficiently

Code is located in course-03/exercises repo:

[https://github.com/manjosk8/cloud-developer/tree/master/course-03/exercises](https://github.com/manjosk8/cloud-developer/tree/master/course-03/exercises)

Travis config is in the root of repository:

[https://github.com/manjosk8/cloud-developer](https://github.com/manjosk8/cloud-developer)

Below are the screenshots and of successful build. Kubernetes screenshots also show version upgrade of frontend app without downtime through label: v2 option.

---

## Links

### Docker Hub

[https://hub.docker.com/u/manjosk8](https://hub.docker.com/u/manjosk8)

### Travis CI

[https://travis-ci.com/github/manjosk8/cloud-developer](https://travis-ci.com/github/manjosk8/cloud-developer)

### Github

[https://github.com/manjosk8/cloud-developer/tree/master/course-03/exercises](https://github.com/manjosk8/cloud-developer/tree/master/course-03/exercises)

---

## Screenshots

### Travis CI

![screenshot](https://github.com/manjosk8/cloud-developer/blob/master/course-03/exercises/screenshots/travis_successfull_build.png)

### Kubernetes

Successful deployment:

![screenshot](https://github.com/manjosk8/cloud-developer/blob/master/course-03/exercises/screenshots/kubernetes_deployment.png)

Upgrade of frontend to v2:

![screenshot](https://github.com/manjosk8/cloud-developer/blob/master/course-03/exercises/screenshots/kubernetes_live_version_upgrade.png)

### App

![screenshot](https://github.com/manjosk8/cloud-developer/blob/master/course-03/exercises/screenshots/udagram_app.png)
#!/bin/bash

# HELP
.DEFAULT_GOAL := help
help:
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
.PHONY: help

##-----------------------------------------
## DOCKER
##-----------------------------------------

docker-build: ## Build docker
	docker compose build

docker-start: ## Start docker
	docker compose up -d

docker-start-recreate: ## Start docker - Recreate
	docker compose up -d --remove-orphans

docker-stop: ## Stop docker
	docker compose stop

docker-kill: ## Kill docker
	- docker compose kill
	- docker compose down --volumes --remove-orphans --rmi=local

##-----------------------------------------
## PROJECT
##-----------------------------------------

start: ## Start project
start: docker-start

stop: ## Stop project
stop: docker-stop

kill: ## Kill project
kill: docker-kill

reset: ## Reset project
reset: docker-kill install
	
##-----------------------------------------
## FRONTEND / BACKEND
##-----------------------------------------

dev-build: ## Build backend / frontend for dev
	- yarn 
	- yarn build
	- yarn prepare

##-----------------------------------------
## DATABASE
##-----------------------------------------

database-build: ## Build database for dev
	- chmod -R +x ./packages/prisma
	- cd ./packages/prisma && yarn
	- cd ./packages/prisma && yarn prisma:generate
	- cd ./packages/prisma && yarn prisma:db:push
	- cd ./packages/prisma && yarn prisma:seed
	- cd ./packages/prisma && yarn build

##-----------------------------------------
## QUALITY
##-----------------------------------------

lint: ## Lint api
	yarn lint
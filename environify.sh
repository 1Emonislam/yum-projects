#!/bin/bash

while [ "$1" != "" ]; do
    case $1 in
        -e | --env )
            shift
            env=$1
        ;;
    esac
    case $1 in
        -c | --cmd )
            shift
            cmd=$1
        ;;
    esac
    shift
done

if [ -z "$cmd" ]
then
    echo "Please provide a command to run"
    exit
fi

if [ -z "$env" ]
then
    echo "Please provide an environment to run"
    exit
fi

if [ "$cmd" == "start-all" ]
then
    echo Running cmd \<concurrently "yarn workspace web start" "yarn workspace mobile start" -n web,mobile -c blue,green -k\> on env $env

    REACT_APP_REALM_APP_ID=$env ./node_modules/.bin/concurrently "yarn workspace web start" "yarn workspace mobile start" -n web,mobile -c blue,green -k
else
    echo Running cmd \<$cmd\> on env $env

    REACT_APP_REALM_APP_ID=$env $cmd
fi


#!/bin/bash
          GITHUB_EVENT_PATH=event.json

          issue_url=$(jq -r ".issue.pull_request.url" "${GITHUB_EVENT_PATH}")
          issue=$(curl "$issue_url")
          base=$(echo $issue | jq -r ".base.ref")
          ref=$(echo $issue | jq -r ".head.ref")
          commenter=$(jq -r ".comment.user.login" "${GITHUB_EVENT_PATH}")


          user=$(curl -u scalecube-js:${{ secrets.GITHUB_TOKEN }} https://api.github.com/repos/scalecube/scalecube-js/collaborators/$commenter/permission)

          if [ "$(jq -r ".permission" $user)" = "admin" ]; then
            is_admin=true
          else
            is_admin=false
          fi

          echo "##[set-output name=base;]$(echo ${base})"
          echo "##[set-output name=ref;]$(echo ${ref})"
          echo "##[set-output name=is_admin;]$(echo ${is_admin})"
          echo "##[set-output name=user;]$(echo ${commenter})"

          author=$(jq -r ".issue.user.login" "${GITHUB_EVENT_PATH}")
          org=$(jq -r ".repository.owner.login" "${GITHUB_EVENT_PATH}")
          pr_number=$(jq -r ".issue.number" "${GITHUB_EVENT_PATH}")
          project=$(jq -r ".repository.name" "${GITHUB_EVENT_PATH}")
          repo=$(jq -r ".repository.full_name" "${GITHUB_EVENT_PATH}")
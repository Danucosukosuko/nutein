# gemini-desktop

### TuneIn Desktop App, an electron wrapper for tunein.com

* For development with gemini-web
  * set up and run https://github.com/tunein/gemini-web locally
  * bun install
  * bun run start

* To run the electron code locally, pointed to production (tunein.com)
  * bun run start-prod

## Build Instructions

* dev requirements: aws key and id stored on machine (bun run build-qa)
* prod requirements: aws key and id stored on machine plus prod Apple app store cert

## Auto Updater Configuration
- Mac target is set to `default` (dmg + zip) because the auto-updater requires the zip output

### Auto Updater Testing Option
To simulate an older app version for updater testing, you can use the Electron app switch with our current local scripts:

```sh
bun run start-stage -- --force-updater-old-version
```

This will override the app version reported to the updater (in development mode), making it easier to test update flows.

## Version History

Available in [Confluence](https://tunein.atlassian.net/wiki/spaces/ENG/pages/63733856/TuneIn.com+Desktop+Releases)

## Github Actions

Changes pushed to regular branches are verified and tested using [branch workflow](./.github/workflows/branch.yaml).

Special branches such as `develop`, `release--*` and `minor-release--*` are built and released using [build and publish workflow](./.github/workflows/build-and-publish.yaml) that relies on [main workflow](./.github/workflows/main.yaml).

### Release Process

**Note**: The release process is planned to be revised in the near future after the monorepo migration is completed.

The release process is semi-automated and involves the following steps:

#### 1. Create a Release Branch

Run the following command and follow the prompts to create a release branch:

```sh
bun run release
```

- Select the appropriate option: `release` or `minor-release`.
- This will create a new branch named `release--x.y.z` or `minor-release--x.y.z`.
- A commit with a version bump will be added automatically.

#### 2. Build and Publish Workflow

The `build and publish` workflow is triggered automatically after creating the release branch. This workflow performs the following actions:

- Builds the application for both QA and PROD environments.
- Publishes the QA build to the S3 bucket.

#### 3. Update and Test QA Build

Once the workflow completes successfully:

1. Update the [Radiomill config settings for STAGE](https://stage-radiomill.tunein.com/editor/settings#searchText=href&settingType=config) with the new file links for QA. Refer to the [Gemini Web Download App Links](#gemini-web-download-app-links) section for details.
2. Test and verify the QA build to ensure it works as expected.

#### 4. Publish to Production

When the QA build is verified and ready for production:

1. Go to the **Actions** tab in GitHub.
2. Locate the latest run of the [build and publish workflow](https://github.com/tunein/gemini-desktop/actions/workflows/build-and-publish.yaml) for the release branch.
3. Approve the "Publish Production" job to trigger the production publish process.
4. Create [UXCM ticket](https://tunein.atlassian.net/jira/software/c/projects/UXCM/boards/361), update the [Radiomill config settings for PROD](https://radiomill.tunein.com/editor/settings#searchText=href&settingType=config) with the new file links for PROD. Refer to the [Gemini Web Download App Links](#gemini-web-download-app-links) section for details.
5. Test and verify the production build.

#### 5. Finalize the Release

1. Run the following command to create a new git tag and merge the release branch back into the `develop` and `main/master` branches:

    ```sh
    bun run mergeNTag
    ```

2. Generate release notes and update the Confluence page or send a release email (handled by the QA engineer):

    ```sh
    bun run releaseNotes
    ```

### Gemini Web Download App Links

In Gemini Web, the desktop app download links are configured in Radiomill settings and need to be updated with each new release:

- Get the `.dmg`/`.exe` file links from the `publish` job logs for the specific environment (look for the `publish files to S3` step).
- Update the following settings in Radiomill:
  - `web.macDesktop.href` with the new `.dmg` file link.
  - `web.windowsDesktop.href` with the new `.exe` file link.

Example link for STAGE settings: [Radiomill config settings for STAGE](https://stage-radiomill.tunein.com/editor/settings#searchText=href&settingType=config).

### MacOS Custom Self-Hosted Runner

To run jobs using the MacOS runner (`runs-on: mac-small`), you need to configure a custom self-hosted runner using existing Mac VMs. Currently, our GitHub Actions pool of self-hosted runners includes only LinuxOS and WindowsOS runners.

We are using the `MacMini SA3 Web` VM, with connection details stored in 1Password. To connect to the VM, use the following command:

```sh
ssh tuneinserviceaccount3@38.39.180.59
# Use the password stored in 1Password
```

If jobs fail due to runner issues (e.g., runner not available), verify the runner status by following the [Verify Runner is Active](#verify-runner-is-active) steps below.

#### Runner Initial Setup Instructions

To perform the initial setup, follow the GitHub Actions runner setup instructions for the specific repository and MacOS Arm64 architecture:

- Instructions can be found [here](https://github.com/tunein/gemini-desktop/settings/actions/runners/new?arch=arm64).
- **Important Notes:**
  - Use `actions-runner-web` as the runner directory name instead of the default `actions-runner`.
  - When prompted, use the `mac-small` label/name as specified in the `main` workflow.
  - The last step is to run `./run.sh` to start the runner. For background execution, follow the [Running Runner in Background](#running-runner-in-background) steps.
  - After setup, verify the runner is active by following the [Verify Runner is Active](#verify-runner-is-active) steps.

#### Running Runner in Background

To run the runner in the background, navigate to the runner directory `actions-runner-web` and execute the following commands:

```sh
nohup ./run.sh &> runner.log < /dev/null &
disown
```

- `nohup` ensures the process continues running even if the terminal is closed.
- Redirecting input/output (`&> runner.log < /dev/null`) ensures logs are saved to `runner.log`.
- `disown` detaches the job from your shell, preventing warnings about active jobs when you exit the shell.

#### Verify Runner is Active

To check if the runner is active:

1. Verify that the runner has two active processes (helper and listener):

    ```sh
    ps aux | grep actions-runner-web
    ```

2. Check if the runner is in `Idle` status and listed on the repository's [action runners page](https://github.com/tunein/gemini-desktop/settings/actions/runners):
   - If the runner is not listed, re-register it by following the [Runner Initial Setup Instructions](#runner-initial-setup-instructions).
   - If the runner is listed but shows an `Offline` status, restart it by following the [Running Runner in Background](#running-runner-in-background) steps.

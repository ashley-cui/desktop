---
sidebar_position: 2
---

# Troubleshooting

Here, find some answers to the question : I have downloaded Container Desktop but I am unable to see any of my image or container

## Podman

### system requirements

The tool connects to Podman using the socket on the host on macOS and on a named pipe on Windows. This is available only on podman 4.0.2+
So, please check your version and update.

On Windows, the named pipe is `//./pipe/docker_engine` when Docker Desktop is not installed. It will be solved by https://github.com/containers/podman/issues/13502 / https://github.com/containers/podman/pull/13655. During that time, you may start Docker Desktop so the named pipe is the one expected.

### Check connection

Check at least a podman machine is running on Windows & macOS:

```bash
podman machine list
```

And check a connection can be made with the CLI

```sh
$ podman run redhat/ubi8-micro echo hello world
```

## Code Ready Containers

- Check that podman preset is defined. (`crc config get preset`)
- Check that `crc` binary is available in the user PATH (`/usr/local/bin/crc`)
- Check that `crc setup --check-only` is running without errors.

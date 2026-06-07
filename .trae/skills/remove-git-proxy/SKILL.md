---
name: "remove-git-proxy"
description: "Removes Git HTTP/HTTPS proxy settings. Invoke when user wants to disable Git proxy or when proxy is no longer needed."
---

# Remove Git Proxy

This skill removes Git HTTP/HTTPS proxy configurations, restoring direct connection to remote repositories.

## When to Use

Invoke this skill when:
- User asks to remove Git proxy
- User wants to disable proxy settings
- User mentions "remove proxy", "unset proxy", or "delete proxy"
- Proxy is causing connection issues
- User wants to switch back to direct connection

## What It Does

Removes the following Git global configurations:
- `http.proxy`
- `https.proxy`

## Usage

Simply invoke the skill, and it will automatically remove the proxy settings.

## Verification

After removing the proxy, you can verify with:
```bash
git config --global --list | grep proxy
```

The command should return nothing if proxy settings are successfully removed.

## Notes

- This removes global Git proxy settings
- Local repository proxy settings (if any) are not affected
- After removal, Git will use direct connection to remote repositories
- To set up proxy again, use the `set-git-proxy` skill

## When to Remove Proxy

Consider removing proxy when:
- You're switching to a different network environment
- Your proxy software is not running
- You want to test direct connection
- You're experiencing connection issues with proxy

## Troubleshooting

If Git still uses proxy after removal:
1. Check for local repository proxy settings: `git config --local --list | grep proxy`
2. Check environment variables: `echo $HTTP_PROXY $HTTPS_PROXY`
3. Verify Git config file: `cat ~/.gitconfig`

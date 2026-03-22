# Contributing to bbb-mobile-sdk

Thanks for taking the time to contribute! 🎉

---

## Before opening an issue

- Search existing issues first — it may already be reported or fixed.
- Make sure you're on the latest version of the SDK.

---

## Reporting a bug

Please include:

- What happened vs. what you expected
- Steps to reproduce
- SDK version (from `package.json`)
- Platform: Android, iOS, or both
- OS version and device model
- Expo SDK version
- Error logs or stack trace, if any

---

## Suggesting a feature

- Describe the problem you're trying to solve
- Describe your proposed solution
- Add any relevant context or examples

---

## Issue title format

```
[Platform] Short description
```

**Examples:**
- `[iOS] Screen rotation lock not working`
- `[Android] Camera fails to open on API 33+`
- `[Android/iOS] Audio cuts after 30 seconds`
- `[Feature] Add picture-in-picture support`

---

## Environment

| | Minimum |
|---|---|
| Node.js | 18 |
| Expo SDK | 52 |
| Android API | 24–35 |
| Xcode | 16.2+ |

## How to contribute

1. Fork the repository
2. Create a branch from the default branch (`main` or current release branch):  
   `git checkout -b feat/short-description`
3. Make your changes and test on Android and/or iOS
4. Run local checks:
   - `npm run lint`
   - `npm run build`
   - Run on device/emulator: `npm run android` / `npm run ios`
5. Commit using Conventional Commits, for example:
   - `git commit -m "feat: add audio mute toggle"`
   - `git commit -m "fix: avoid crash on orientation change"`
6. Push to your fork and open a Pull Request against the default branch
7. In the PR description include:
   - Related issue reference (e.g. `Closes #42`)
   - Short summary of changes and testing steps
   - Screenshots or recordings if UI changes
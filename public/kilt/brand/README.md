# Capy brand assets

Capy's own shipped files, byte-identical to what capy.ai serves (Keyur's decision: ship the brand as-is). Hashes were dropped from the file names; Vite re-adds its own.

| Path                                      | What                                                                                          | Where Capy uses it                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `app-icon.png`                            | App icon                                                                                      | Welcome page                                              |
| `app/`                                    | favicon (svg, png), apple-touch-icon, PWA icons (192, 512, 512 maskable), notification badges | `index.html`, `/api/manifest`, web push                   |
| `avatars/capy-avatar-{1,2,3,5,6,7,8}.png` | Captain avatar presets (there is no 4)                                                        | `CaptainAvatar`                                           |
| `avatars/capy-mark-ffffff.png`            | Capy mark on white                                                                            | Slack bot avatar                                          |
| `illustrations/`                          | Capybara poses and `capy-sleeping.webp`                                                       | Empty states, Captain/build/review marks, design fixtures |
| `onboarding/`                             | Onboarding cards (light/dark) and desktop-app promo                                           | Onboarding, desktop-app card                              |
| `announcements/`                          | Changelog images, named by release                                                            | What's new                                                |
| `devices/`                                | Device frames                                                                                 | Mobile and desktop previews                               |
| `guides/`                                 | Integration setup screenshots                                                                 | Slack and Tailscale settings                              |
| `wordmark.svg`                            | Wordmark art as a `<use>` sprite: light and dark layers plus five hover faces                 | `Wordmark`                                                |

Import URLs from `@/assets/brand` (`APP_ASSETS`, `CAPY_ILLUSTRATIONS`, `ONBOARDING_IMAGES`, ...) rather than from file paths.

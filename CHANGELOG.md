# 1.5.0 (2022-02-07)

ENHANCEMENT:

- Implement Proxy usage ([#11](https://github.com/hashicorp/js-releases/pull/11))

DEPENDENCIES:

- Bump openpgpjs to v5.1.0 ([#15](https://github.com/hashicorp/js-releases/pull/15))
- Upgrade openpgpjs to v5.0.1 stable and modify usage ([#12](https://github.com/hashicorp/js-releases/pull/12))

# 1.4.0 (2021-04-23)

Security:

- Update public GPG key for validating releases (#9)

Dependencies:

- Upgrade openpgpjs to v5.0 pre-release (#8)

# 1.3.0 (2021-02-08)

- Update dependencies and set explicit https url for GitHub dependency (#5)

# 1.2.1 (2020-12-09)

- Replace openpgp with fork to fix downstream bundle (#4)

# 1.2.0 (2020-12-01)

- Allow pre-release version ranges (#2)

# 1.1.0 (2020-11-17)

- Match version ranges (#1)

# 1.0.2 (2020-11-13)

Bugs:
- Fix handling of request for latest release
- Republish patch to fix build error

# 1.0.0

js-releases is a handy tool for downloading and verifying packages from releases.hashicorp.com. You can:
 - fetch metadata for a given release (or latest)
 - download the package
 - verify the SHASUM and signature
 - unpack to a specified directory

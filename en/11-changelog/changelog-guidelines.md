# Change Log & Documentation Versioning Guidelines

## 1. Purpose

This guide determines when documentation changes need to be added to the change log and when the documentation version needs to be incremented. The purpose is to keep the history easy to understand for both non-technical and technical people without making the change log too crowded.

## 2. Quick Decision Rules

Use the following questions before making a change:

1. Has the user or programmer's ability changed?
2. Has the old behavior or business rule changed?
3. Does the frontend, backend, database, or other SaaS application need to be adjusted?
4. Can the reader of the old documentation make a wrong decision if they do not read about this change?

If at least one answer is **yes**, add the change to the next documentation release and write it in the change log.

```text
Is it just a way to explain what changed?
  → No need for a new version; just a Git commit.

Data, screen, API, business rule, or integration changed?
  → Create a new documentation version.

The old integration is no longer functional without adjustment?
  → Breaking change; increment the major version.
```

## 3. Change Classification

| Type | Example | Enter change log/version? |
|---|---|---|
| Editorial | Typo, grammar, table format | No; just a Git commit. |
| Documentation lag | Feature has been running but not written | Usually no; write a note if the update is important. |
| New feature | Xendit, new product, invoice download, new notification | Yes, category `Added`. |
| Behavior change | Grace period 7 days becomes 14 days | Yes, category `Changed`. |
| Bug fix | Webhook retry previously caused duplicate emails | Yes, category `Fixed`. |
| Technical change | Redis/BullMQ, email provider, monitoring | Yes, category `Technical` if it affects operation/maintenance. |
| Deprecation | Endpoint still running but will be stopped | Yes, category `Deprecated`. |
| Removal | Endpoint or feature no longer available | Yes, category `Removed`. |
| Breaking change | JWT claim removed, API URL changed, License-ID format changed | Yes, increment major version. |

## 4. Version Rules

The documentation version follows the format `vMAJOR.MINOR`.

| Change | Example | Version |
|---|---|---|
| Initial baseline | First approved document snapshot | `v1.0` |
| Feature/rule/compatible change | Adding an endpoint or payment gateway | `v1.0 → v1.1` |
| Next compatible change | Adding documentation for a queue or admin flow | `v1.1 → v1.2` |
| Breaking change | Endpoint/payload old is not compatible | `v1.x → v2.0` |

Small changes can be collected in one documentation release. Do not increment the version just because of a typo or Markdown formatting.

## 5. Changelog Format

Use the following categories only if there is content:

```md
## v1.1 — YYYY-MM-DD

### Added
- New feature or ability.

### Changed
- Behavior, business rule, UI, API, or architecture that changed.

### Fixed
- Bug or inconsistency fixed.

### Deprecated
- Part still available but will be stopped.

### Removed
- Part already not available.

### Technical
- Internal change for operation and maintenance.
```

Each important item should explain its impact:

```md
### Added
- Xendit integration as a payment gateway.
  - User impact: additional payment options available.
  - Programmer impact: implement Xendit webhook and new environment variable.
```

## 6. History Storage

| Artifact | Function |
|---|---|
| Git commit | Most detailed technical history per file/line. |
| `11-changelog/changelog.md` | Summary of all releases for readers. |
| `11-changelog/changelog-guidelines.md` | Rules for taking versioning decisions. |
| `versions/vX.Y/` | Snapshot of all docs for website documentation, when feature versioning website is created. |
| Git tag `docs-vX.Y` | Official source snapshot documentation marker. |

## 7. Documentation Release Checklist

- [ ] Determine the change category and new version.
- [ ] Update all affected documents.
- [ ] Add a human-readable summary to `changelog.md`.
- [ ] Create a snapshot `versions/vX.Y/` if the versioned documentation portal is already active.
- [ ] Create a Git tag `docs-vX.Y` after the change is reviewed and approved.
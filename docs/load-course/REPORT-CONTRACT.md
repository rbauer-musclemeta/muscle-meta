# Report contract: sub-agent to orchestrator

Every sub-agent ends its work with exactly one report, in this format, and
nothing else after it. Keep each field short. The orchestrator reads these
programmatically, so keep the keys and the order exactly as shown.

```
REPORT
task_id: A3
branch: load-course/A3-tool
status: done            # done | blocked | needs-decision
summary: One sentence on what was produced.
files_changed:
  - site/tools/joint-load-check/index.html (new, 412 lines)
checks_run:
  - name: no hex values in new files
    result: pass
  - name: no emoji
    result: pass
  - name: no "Kajabi" string
    result: pass
  - name: renders at 390px (preview URL: <url>)
    result: pass
  - name: red-flag screen appears before step 1
    result: pass
claims_touched:            # claim IDs from the register, if any
  - C01
open_items:
  - TODO-A2 placeholders remain in the red-flag box (replace after A2 merges)
decisions_needed:          # questions for Randy, one per line
  - none
blocked_on:                # only when status is blocked
  - none
```

## Rules for filling it in

- `status: done` only when every check the prompt requires has been run and passed. A failed check means `status: blocked`, with the failure in `open_items`.
- `status: needs-decision` when the task needs a choice only Randy can make. Put the question in `decisions_needed` as a single sentence.
- `checks_run` lists every check, including the ones that passed. Do not summarise them as "all checks passed".
- `claims_touched` lists claim IDs only. Do not paste citation text into the report.
- Never include secrets, keys, health answers or personal data in a report.
- If the branch was not pushed, write `branch: not pushed` and explain why in `open_items`.

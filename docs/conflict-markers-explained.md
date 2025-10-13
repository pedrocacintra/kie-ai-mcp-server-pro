# Understanding Git Conflict Markers

When Git tells you there is a conflict, it inserts special markers into the affected files so you can decide what the final content should be. These markers look like this:

```
<<<<<<< HEAD
content from the branch you are on
=======
content from the branch you are merging in
>>>>>>> other-branch-name
```

Here is what each part means:

- `<<<<<<< HEAD` — everything between this line and the `=======` line is what currently exists on **your** branch (the version you had checked out when the conflict happened).
- `=======` — this line separates the two competing versions of the same section of the file.
- `>>>>>>> other-branch-name` — everything between the `=======` line and this line is what Git found on the **other** branch (the one you are trying to merge or pull).

## How to resolve the conflict

1. Read both versions and decide what the file should look like when you are done. You can keep one side, combine pieces from both, or rewrite the section entirely.
2. Delete the conflict marker lines themselves (`<<<<<<<`, `=======`, and `>>>>>>>`). They are just placeholders to show you the conflict; they must not remain in the final file.
3. Make sure the remaining text is exactly what you want to keep.
4. Save the file.
5. Tell Git that the file is fixed by running `git add <filename>`.
6. Once every conflicted file is added, create a commit (for example, run `git commit`).

After that, you can push the branch or continue with your merge, and GitHub will see that the conflicts have been resolved.

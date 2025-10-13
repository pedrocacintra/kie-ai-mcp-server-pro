# Understanding Git Conflict Markers (Plain-English Guide)

When GitHub says “This branch has conflicts,” it means the same part of a file was changed in two different places. Git places **conflict markers** inside the file so you can choose what should stay.

Those markers always look the same:

```
<<<<<<< HEAD
⚠️ This is the version that is currently on **your** branch.
=======
⚠️ This is the version coming from the branch you are trying to merge (often `main`).
>>>>>>> other-branch-name
```

Think of them as a sandwich:

* The top bread (`<<<<<<< HEAD`) starts the slice that belongs to you.
* The middle divider (`=======`) separates the two versions.
* The bottom bread (`>>>>>>> other-branch-name`) ends the slice that came from the other branch.

## Step-by-step: fixing it directly on GitHub

1. Open the pull request and click **Resolve conflicts**.
2. GitHub shows each affected file in an editor. Inside the file, look for the markers shown above.
3. Decide what the final text should be:
   * Keep only the top section if your copy is correct.
   * Keep only the bottom section if the incoming copy is correct.
   * Or mix the two by copying the bits you want from each side.
4. **Delete the marker lines themselves** (`<<<<<<<`, `=======`, `>>>>>>>`). They are just signposts—your final file should not contain them.
5. Double-check the remaining text. It should read exactly how you want the finished file to look.
6. Scroll to the bottom of the page and click **Mark as resolved**.
7. Repeat steps 2–6 for every file that shows a conflict.
8. When every file is marked resolved, click **Commit merge**. GitHub will create a commit that saves your decisions.

After that commit appears on the pull request, the red warning banner should disappear and the **Merge** button will become available.

## Optional: fixing the same thing on your computer

If you prefer to edit locally (or the web editor feels cramped), follow the same idea:

1. Open the file in your editor.
2. Remove the parts you do not want and delete the marker lines.
3. Save, run `git add <filename>` for each file, then `git commit` once everything is fixed.
4. Push the branch (`git push`). GitHub will see the conflicts are resolved.

The key is simple: **decide which version of the text you want, erase the markers, and save only the good content.** Once that’s done, Git considers the conflict solved.

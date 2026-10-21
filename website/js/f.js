// Projects approval/rejection buttons
                "<td>" + (canApprove && p.status === "Pending"
                  ? '<button class="btn btn-success btn-xs" data-approve-project="' + p.id + '\">Approve</button> ' +
                    '<button class="btn btn-danger btn-xs" data-reject-project="' + p.id + '\">Reject</button>'
                  : "<span style='font-size:0.78rem;color:var(--text)'>" + (p.by || "") + "</span>") + "</td>"
// Task approval/rejection buttons
                "<td>" + (canApprove && t.status === "Pending"
                  ? '<button class="btn btn-success btn-xs" data-approve-task="' + t.id + '\">Approve</button> ' +
                    '<button class="btn btn-danger btn-xs" data-reject-task="' + t.id + '\">Reject</button>'
                  : "<span style='font-size:0.78rem;color:var(--text)'>" + (t.by || "") + "</span>") + "</td>"

    // Project approval/rejection event handlers
    document.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-approve-project')) {
        const projectId = e.target.getAttribute('data-approve-project');
        PHG_API.approveProject(projectId);
      }
      if (e.target.hasAttribute('data-reject-project')) {
        const projectId = e.target.getAttribute('data-reject-project');
        if (confirm('Are you sure you want to reject this project?')) {
          const note = prompt('Enter rejection note (optional):');
          PHG_API.rejectProject(projectId, note);
        }
      }
    });

    // Task approval/rejection event handlers
    document.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-approve-task')) {
        const taskId = e.target.getAttribute('data-approve-task');
        PHG_API.approveTask(taskId);
      }
      if (e.target.hasAttribute('data-reject-task')) {
        const taskId = e.target.getAttribute('data-reject-task');
        if (confirm('Are you sure you want to reject this task?')) {
          const note = prompt('Enter rejection note (optional):');
          PHG_API.rejectTask(taskId, note);
        }
      }
    });
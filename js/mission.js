document.addEventListener("DOMContentLoaded", () => {
  // 选择器
  const missions     = document.querySelectorAll(".mission-item");
  const pieces       = document.querySelectorAll(".puzzle-piece");
  const progressBar  = document.getElementById("progress");      // .progress-fill
  const progressText = document.getElementById("progressText");  // 数字
  const resetBtn     = document.querySelector(".start-btn");     // 顶部 Reset 按钮

  // 弹窗
  const modal      = document.getElementById("completeModal");
  const modalClose = document.getElementById("modalClose");
  const modalReset = document.getElementById("modalReset");

  let completed = 0;

  function openModal() {
    if (!modal) return;
    modal.classList.add("show");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
  }

  function renderProgress() {
    const total = missions.length;
    const pct = Math.round((completed / total) * 100);
    if (progressBar)  progressBar.style.width = pct + "%";
    if (progressText) progressText.textContent = `${completed}/${total} (${pct}%)`;

    // 全部完成 → 弹窗
    if (completed === total && total > 0) {
      openModal();
    }
  }

  // 点击任务：点亮左侧 & 拼图
  missions.forEach((m, idx) => {
    m.addEventListener("click", () => {
      if (!m.classList.contains("completed")) {
        m.classList.add("completed");
        if (pieces[idx]) pieces[idx].classList.add("active");
        completed++;
        renderProgress();
      }
    });
  });

  // Reset：清空所有状态
  function doReset() {
    completed = 0;
    missions.forEach(m => m.classList.remove("completed"));
    pieces.forEach(p => p.classList.remove("active"));
    renderProgress();
    closeModal();
  }

  resetBtn?.addEventListener("click", doReset);
  modalClose?.addEventListener("click", closeModal);
  modalReset?.addEventListener("click", doReset);

  // 点击遮罩关闭（可选）
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // 首次渲染
  renderProgress();
});

// 拖拽相关逻辑
const draggableImage = document.getElementById("draggableImage");
const dropZone = document.getElementById("printTarget");

if (draggableImage && dropZone) {
  draggableImage.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", "illustration");
    draggableImage.style.opacity = "0.5";
  });

  draggableImage.addEventListener("dragend", () => {
    draggableImage.style.opacity = "1";
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.background = "#fff3e6";
    dropZone.style.borderColor = "#f28500";
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.style.background = "#f3ece5";
    dropZone.style.borderColor = "var(--accent-orange)";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (data === "illustration") {
      alert("🖨️ Printing illustration...");
      dropZone.style.background = "#eaf8ea";
      dropZone.textContent = "✅ Illustration printed!";
    }
  });
}

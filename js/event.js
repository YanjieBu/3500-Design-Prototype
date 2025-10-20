// Event Page JavaScript

// 全局变量
let isDragging = false;
let dragElement = null;
let selectedTimeSlot = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeTimeSlots();
    initializeDragAndDrop();
});

// 初始化时间槽
function initializeTimeSlots() {
    // 为所有可拖拽的时间槽添加事件
    document.querySelectorAll('.time-cell.highlight').forEach(cell => {
        cell.addEventListener('mousedown', handleDragStart);
        cell.addEventListener('touchstart', handleDragStart, { passive: false });
    });
    
    // 为空时间槽添加点击事件
    document.querySelectorAll('.time-cell:not(.highlight):not(.public)').forEach(cell => {
        cell.addEventListener('click', function() {
            // 清除选中状态
            if (selectedTimeSlot) {
                selectedTimeSlot.classList.remove('selected');
                selectedTimeSlot = null;
            }
        });
    });
}

// 统一的拖拽处理函数
function handleDragStart(e) {
    if (!e.target.closest('.time-cell.highlight')) {
        return;
    }
    
    e.preventDefault();
    
    const originalCell = e.target.closest('.time-cell');
    let hasMoved = false;
    
    // 获取初始坐标（支持鼠标和触摸）
    const getCoordinates = (event) => {
        if (event.touches && event.touches.length > 0) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        } else if (event.changedTouches && event.changedTouches.length > 0) {
            return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
        }
        return { x: event.clientX, y: event.clientY };
    };
    
    const onMove = function(moveEvent) {
        moveEvent.preventDefault();
        const coords = getCoordinates(moveEvent);
        
        if (!hasMoved) {
            hasMoved = true;
            isDragging = true;
            
            // 创建拖拽元素
            createDragElement(originalCell);
            originalCell.style.opacity = '0.3';
        }
        
        // 更新拖拽元素位置
        if (dragElement) {
            dragElement.style.left = (coords.x + 10) + 'px';
            dragElement.style.top = (coords.y + 10) + 'px';
            
            // 检查是否在instruction区域
            const instruction = document.querySelector('.instruction');
            const rect = instruction.getBoundingClientRect();
            
            if (coords.x >= rect.left && 
                coords.x <= rect.right &&
                coords.y >= rect.top && 
                coords.y <= rect.bottom) {
                instruction.classList.add('drag-over');
            } else {
                instruction.classList.remove('drag-over');
            }
        }
    };
    
    const onEnd = function(endEvent) {
        // 移除事件监听
        if (endEvent.type.includes('mouse')) {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
        } else {
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            document.removeEventListener('touchcancel', onEnd);
        }
        
        originalCell.style.opacity = '';
        
        const instruction = document.querySelector('.instruction');
        instruction.classList.remove('drag-over');
        
        if (hasMoved && dragElement) {
            // 获取结束坐标
            const endCoords = getCoordinates(endEvent);
            
            // 检查是否拖到了instruction区域
            const rect = instruction.getBoundingClientRect();
            
            if (endCoords.x >= rect.left && 
                endCoords.x <= rect.right &&
                endCoords.y >= rect.top && 
                endCoords.y <= rect.bottom) {
                showSuccessModal();
            }
            
            dragElement.remove();
            dragElement = null;
        }
        
        isDragging = false;
        hasMoved = false;
    };
    
    // 根据事件类型添加相应的监听器
    if (e.type.includes('mouse')) {
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
    } else {
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
    }
}

// 创建拖拽元素
function createDragElement(originalCell) {
    dragElement = document.createElement('div');
    dragElement.id = 'drag-ghost-element';
    dragElement.style.position = 'fixed';
    dragElement.style.zIndex = '999999';
    dragElement.style.backgroundColor = '#ff9a56';
    dragElement.style.color = 'white';
    dragElement.style.padding = '20px 30px';
    dragElement.style.borderRadius = '15px';
    dragElement.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    dragElement.style.fontWeight = 'bold';
    dragElement.style.fontSize = '1.3em';
    dragElement.style.pointerEvents = 'none';
    dragElement.style.transform = 'rotate(-5deg)';
    dragElement.style.webkitUserSelect = 'none';
    dragElement.style.userSelect = 'none';
    
    // 获取时间槽信息
    const timeSlot = originalCell.closest('.time-slot');
    const timeLabel = timeSlot.querySelector('.time-label').textContent;
    const eventName = originalCell.querySelector('.event-name');
    
    if (eventName) {
        dragElement.textContent = eventName.textContent + ' (' + timeLabel + ')';
    } else {
        dragElement.textContent = 'Time Slot: ' + timeLabel;
    }
    
    document.body.appendChild(dragElement);
}

// 初始化拖放功能
function initializeDragAndDrop() {
    // 为instruction区域添加拖放事件
    const instruction = document.querySelector('.instruction');
    
    instruction.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    instruction.addEventListener('dragleave', function(e) {
        this.classList.remove('drag-over');
    });
    
    instruction.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        showSuccessModal();
    });
}

// 显示成功弹窗
function showSuccessModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="modal-header">
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <div class="success-icon">✓</div>
            <p class="success-text">Join successful! Please take the receipt.</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    // 更新进度条
    updateProgress();
    
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    function closeModal() {
        overlay.remove();
        modal.remove();
    }
}

// 更新进度条
function updateProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    // 模拟增加参与人数
    let currentParticipants = 3;
    let maxParticipants = 5;
    
    // 增加一个参与者
    currentParticipants = Math.min(currentParticipants + 1, maxParticipants);
    
    // 更新进度条宽度
    const percentage = (currentParticipants / maxParticipants) * 100;
    progressFill.style.width = percentage + '%';
    
    // 更新文本
    const remaining = maxParticipants - currentParticipants;
    if (remaining > 0) {
        progressText.textContent = `${currentParticipants} / ${maxParticipants} , only ${remaining} left`;
    } else {
        progressText.textContent = `${currentParticipants} / ${maxParticipants} , FULL`;
    }
}

// Start Event按钮点击事件
document.querySelector('.start-btn').addEventListener('click', function() {
    showTicketScanModal();
});

// 显示扫描门票弹窗
function showTicketScanModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.style.width = '90%';
    modal.style.maxWidth = '600px';
    
    modal.innerHTML = `
        <div class="modal-header">
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body" style="padding: 40px;">
            <h2 style="font-family: 'Brush Script MT', cursive; font-size: 1.8em; margin-bottom: 20px; color: #333;">Scan Tickets</h2>
            <p style="font-size: 1em; color: #666; margin-bottom: 20px;">Please scan participants' tickets</p>
            
            <div id="camera-container" style="width: 100%; height: 200px; background: #333; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <video id="camera-feed" style="width: 100%; height: 100%; object-fit: cover; display: none;"></video>
                <div id="camera-placeholder" style="color: white; text-align: center;">Click Start Camera to begin scanning</div>
            </div>
            <button id="start-camera-btn" style="width: 100%; padding: 12px; background: #c17457; color: white; border: none; border-radius: 8px; font-size: 1em; font-family: inherit; cursor: pointer; margin-bottom: 20px; transition: all 0.3s;">Start Camera</button>
            
            <div style="background: #f0ead6; border-radius: 10px; padding: 20px; margin-bottom: 20px; min-height: 100px;">
                <div id="ticket-list" style="display: flex; flex-wrap: wrap; gap: 10px;">
                    <!-- 扫描的门票将显示在这里 -->
                </div>
                <p id="no-tickets" style="color: #999; text-align: center; margin: 0;">No tickets scanned yet</p>
            </div>
            
            <p id="ticket-count" style="text-align: center; color: #666; margin-bottom: 20px;">Participants: <span style="font-weight: bold; color: #c17457;">0</span></p>
            
            <button id="next-btn" style="width: 100%; padding: 15px; background: #5a7a5a; color: white; border: none; border-radius: 8px; font-size: 1.1em; font-family: 'Brush Script MT', cursive; cursor: pointer; transition: all 0.3s;">Next Step</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    let scannedTickets = [];
    let cameraStream = null;
    let ticketCounter = 0;
    let scanInterval = null;
    
    const cameraContainer = modal.querySelector('#camera-container');
    const cameraPlaceholder = modal.querySelector('#camera-placeholder');
    const startCameraBtn = modal.querySelector('#start-camera-btn');
    const cameraFeed = modal.querySelector('#camera-feed');
    const ticketList = modal.querySelector('#ticket-list');
    const noTickets = modal.querySelector('#no-tickets');
    const ticketCountSpan = modal.querySelector('#ticket-count span');
    const nextBtn = modal.querySelector('#next-btn');
    const closeBtn = modal.querySelector('.close-btn');
    
    // 启动摄像头
    startCameraBtn.addEventListener('click', async function() {
        if (!cameraStream) {
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                cameraFeed.srcObject = cameraStream;
                cameraFeed.style.display = 'block';
                cameraPlaceholder.style.display = 'none';
                startCameraBtn.textContent = 'Stop Camera';
                startCameraBtn.style.background = '#8b4e3a';
                
                // 每3秒自动扫描一个门票
                scanInterval = setInterval(() => {
                    if (cameraStream && cameraStream.active) {
                        ticketCounter++;
                        scannedTickets.push(`Ticket-${Date.now()}-${ticketCounter}`);
                        updateTicketDisplay();
                    }
                }, 3000);
            } catch (error) {
                alert('Unable to access camera. Please check permissions.');
                console.error('Camera error:', error);
            }
        } else {
            // 停止摄像头
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
            cameraFeed.srcObject = null;
            cameraFeed.style.display = 'none';
            cameraPlaceholder.style.display = 'block';
            startCameraBtn.textContent = 'Start Camera';
            startCameraBtn.style.background = '#c17457';
            
            // 清除扫描间隔
            if (scanInterval) {
                clearInterval(scanInterval);
                scanInterval = null;
            }
        }
    });
    
    // 更新门票显示
    function updateTicketDisplay() {
        ticketList.innerHTML = '';
        scannedTickets.forEach((ticket, index) => {
            const ticketTag = document.createElement('div');
            ticketTag.style.cssText = `
                background: #c17457;
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 0.9em;
            `;
            
            ticketTag.innerHTML = `
                <span>Participant #${index + 1}</span>
                <button class="remove-ticket" data-index="${index}" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2em; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">×</button>
            `;
            
            ticketList.appendChild(ticketTag);
        });
        
        // 添加删除按钮事件
        document.querySelectorAll('.remove-ticket').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                scannedTickets.splice(index, 1);
                updateTicketDisplay();
            });
        });
        
        // 更新计数
        if (scannedTickets.length > 0) {
            noTickets.style.display = 'none';
            ticketCountSpan.textContent = scannedTickets.length;
        } else {
            noTickets.style.display = 'block';
            ticketCountSpan.textContent = '0';
        }
    }
    
    // 下一步按钮
    nextBtn.addEventListener('click', function() {
        // 停止摄像头
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        if (scanInterval) {
            clearInterval(scanInterval);
            scanInterval = null;
        }
        
        // 显示确认对话
        showConfirmDialog();
    });
    
    // 显示确认对话
    function showConfirmDialog() {
        const confirmOverlay = document.createElement('div');
        confirmOverlay.className = 'modal-overlay';
        confirmOverlay.style.zIndex = '1002';
        
        const confirmModal = document.createElement('div');
        confirmModal.className = 'success-modal';
        confirmModal.style.zIndex = '1003';
        confirmModal.style.maxWidth = '400px';
        
        confirmModal.innerHTML = `
            <div class="modal-body" style="padding: 60px 40px; text-align: center;">
                <h2 style="font-family: 'Brush Script MT', cursive; font-size: 1.6em; margin-bottom: 20px; color: #333;">Have you scanned all participants?</h2>
                <p style="font-size: 1em; color: #666; margin-bottom: 30px;">Participants scanned: <span style="font-weight: bold; color: #c17457;">${scannedTickets.length}</span></p>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="confirm-no" style="padding: 12px 30px; background: #bbb; color: white; border: none; border-radius: 8px; font-size: 1em; cursor: pointer; transition: all 0.3s;">No, Continue Scanning</button>
                    <button id="confirm-yes" style="padding: 12px 30px; background: #5a7a5a; color: white; border: none; border-radius: 8px; font-size: 1em; cursor: pointer; transition: all 0.3s;">Yes, Proceed</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmOverlay);
        document.body.appendChild(confirmModal);
        
        const confirmNo = confirmModal.querySelector('#confirm-no');
        const confirmYes = confirmModal.querySelector('#confirm-yes');
        
        confirmNo.addEventListener('click', function() {
            confirmOverlay.remove();
            confirmModal.remove();
            // 重新启动摄像头
            if (!cameraStream) {
                startCameraBtn.click();
            }
        });
        
        confirmYes.addEventListener('click', function() {
            confirmOverlay.remove();
            confirmModal.remove();
            overlay.remove();
            modal.remove();
            // 可以添加跳转到下一页的逻辑，或其他操作
            alert('Proceeding with ' + scannedTickets.length + ' participants');
        });
        
        confirmOverlay.addEventListener('click', function(e) {
            if (e.target === confirmOverlay) {
                confirmOverlay.remove();
                confirmModal.remove();
            }
        });
    }
    
    // 关闭按钮
    closeBtn.addEventListener('click', function() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        if (scanInterval) {
            clearInterval(scanInterval);
            scanInterval = null;
        }
        overlay.remove();
        modal.remove();
    });
    
    // 背景点击关闭
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraStream = null;
            }
            if (scanInterval) {
                clearInterval(scanInterval);
                scanInterval = null;
            }
            overlay.remove();
            modal.remove();
        }
    });
}

// 搜索功能
document.querySelector('.search-bar input').addEventListener('input', function(e) {
    console.log('搜索内容：', e.target.value);
    // 这里可以添加搜索逻辑
});

// 返回按钮点击事件
document.querySelector('.back-arrow').addEventListener('click', function() {
    window.location.href = 'index.html';
});
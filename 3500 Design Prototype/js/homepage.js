// 全局变量存储当前选中的卡片
let selectedCard = null;
let isDragging = false;
let dragElement = null;
let clickTimeout = null;

// 为所有菜品卡片添加点击事件
document.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', function(e) {
        const dishId = this.getAttribute('data-dish');
        
        // 清除之前的点击计时器
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }
        
        // 移除之前的选中状态
        if (selectedCard) {
            selectedCard.classList.remove('selected');
        }
        
        // 移除所有高亮
        document.querySelectorAll('.time-cell').forEach(cell => {
            cell.classList.remove('highlight');
        });
        
        // 设置新的选中状态
        this.classList.add('selected');
        selectedCard = this;
        
        // 高亮对应的特定时间块
        document.querySelectorAll(`.time-cell[data-dish="${dishId}"]`).forEach(cell => {
            cell.classList.add('highlight');
        });
        
        // 单击后延迟判断（防止双击时触发）
        clickTimeout = setTimeout(() => {
            // 这里的单击逻辑已由时间块的单击处理
        }, 300);
    });
    
    // 双击跳转到event.html
    card.addEventListener('dblclick', function() {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }
        window.location.href = 'event.html';
    });
});

// 为高亮的时间块添加拖拽和单击功能
document.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('time-cell') && e.target.classList.contains('highlight')) {
        e.preventDefault();
        
        const originalCell = e.target;
        let hasMoved = false;
        
        const onMouseMove = function(moveEvent) {
            moveEvent.preventDefault();
            
            if (!hasMoved) {
                hasMoved = true;
                isDragging = true;
                
                // 创建拖拽元素
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
                
                // 显示菜品名称
                if (selectedCard) {
                    const recipeName = selectedCard.querySelector('.recipe-name').textContent;
                    dragElement.textContent = recipeName;
                } else {
                    dragElement.textContent = 'Recipe Tag';
                }
                
                document.body.appendChild(dragElement);
                originalCell.style.opacity = '0.3';
                
                console.log('拖拽元素已创建，ID:', dragElement.id);
            }
            
            // 更新拖拽元素位置
            if (dragElement) {
                dragElement.style.left = (moveEvent.clientX + 10) + 'px';
                dragElement.style.top = (moveEvent.clientY + 10) + 'px';
                
                // 检查是否在instruction区域
                const instruction = document.querySelector('.instruction');
                const rect = instruction.getBoundingClientRect();
                
                if (moveEvent.clientX >= rect.left && 
                    moveEvent.clientX <= rect.right &&
                    moveEvent.clientY >= rect.top && 
                    moveEvent.clientY <= rect.bottom) {
                    instruction.classList.add('drag-over');
                } else {
                    instruction.classList.remove('drag-over');
                }
            }
        };
        
        const onMouseUp = function(upEvent) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            originalCell.style.opacity = '';
            
            const instruction = document.querySelector('.instruction');
            instruction.classList.remove('drag-over');
            
            if (hasMoved && dragElement) {
                console.log('拖拽结束');
                
                // 检查是否拖到了instruction区域
                const rect = instruction.getBoundingClientRect();
                
                if (upEvent.clientX >= rect.left && 
                    upEvent.clientX <= rect.right &&
                    upEvent.clientY >= rect.top && 
                    upEvent.clientY <= rect.bottom) {
                    showSuccessModal();
                }
                
                dragElement.remove();
                dragElement = null;
            } else if (!hasMoved) {
                // 快速点击，跳转到event.html
                window.location.href = 'event.html';
            }
            
            isDragging = false;
            hasMoved = false;
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
});

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
    
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    function closeModal() {
        overlay.remove();
        modal.remove();
    }
}

// 为时间块添加点击事件
document.querySelectorAll('.time-cell').forEach(cell => {
    cell.addEventListener('click', function(e) {
        if (isDragging) {
            return;
        }
        
        if (!this.classList.contains('filled') && !this.classList.contains('public') && !this.classList.contains('highlight')) {
            document.querySelectorAll('.time-cell').forEach(c => {
                c.classList.remove('highlight');
            });
            if (selectedCard) {
                selectedCard.classList.remove('selected');
                selectedCard = null;
            }
        }
    });
});

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
            window.location.href = 'mission.html';
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

// 标签页切换功能
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // 移除所有标签的active状态
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
        });
        
        // 添加当前标签的active状态
        this.classList.add('active');
        
        // 获取点击的标签文本
        const tabName = this.textContent.trim();
        
        // 隐藏所有菜系区域
        document.querySelectorAll('.cuisine-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // 显示对应的菜系
        if (tabName === 'Worldwide') {
            // 显示所有菜系
            document.querySelectorAll('.cuisine-section').forEach(section => {
                section.style.display = 'block';
            });
        } else if (tabName === 'Asian') {
            // 只显示Asian Cuisine
            const asianSection = Array.from(document.querySelectorAll('.cuisine-section')).find(
                section => section.querySelector('.cuisine-title').textContent.includes('Asian')
            );
            if (asianSection) {
                asianSection.style.display = 'block';
            }
        } else if (tabName === 'European') {
            // 只显示European Cuisine
            const europeanSection = Array.from(document.querySelectorAll('.cuisine-section')).find(
                section => section.querySelector('.cuisine-title').textContent.includes('European')
            );
            if (europeanSection) {
                europeanSection.style.display = 'block';
            }
        } else if (tabName === 'Oceania') {
            // 只显示Oceanian Cuisine
            const oceanianSection = Array.from(document.querySelectorAll('.cuisine-section')).find(
                section => section.querySelector('.cuisine-title').textContent.includes('Oceanian')
            );
            if (oceanianSection) {
                oceanianSection.style.display = 'block';
            }
        }
        
        // 滚动到内容区域顶部
        const contentArea = document.querySelector('.content-area');
        contentArea.scrollTop = 0;
    });
});

// 为菜谱区域添加鼠标拖拽滚动功能
document.querySelectorAll('.cuisine-section').forEach(section => {
    let isDown = false;
    let startX;
    let scrollLeft;
    let hasDragged = false;

    section.addEventListener('mousedown', (e) => {
        // 如果点击的是卡片，不启动拖拽滚动
        if (e.target.closest('.recipe-card')) {
            return;
        }
        
        isDown = true;
        hasDragged = false;
        section.style.cursor = 'grabbing';
        startX = e.pageX - section.offsetLeft;
        scrollLeft = section.scrollLeft;
    });

    section.addEventListener('mouseleave', () => {
        isDown = false;
        section.style.cursor = 'default';
    });

    section.addEventListener('mouseup', () => {
        isDown = false;
        section.style.cursor = 'default';
        
        // 短暂延迟后重置标志，防止点击事件触发
        setTimeout(() => {
            hasDragged = false;
        }, 10);
    });

    section.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        hasDragged = true;
        const x = e.pageX - section.offsetLeft;
        const walk = (x - startX) * 2; // 滚动速度倍数
        section.scrollLeft = scrollLeft - walk;
    });

    // 阻止拖拽滚动时触发卡片点击
    section.addEventListener('click', (e) => {
        if (hasDragged && e.target.closest('.recipe-card')) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, true);
});
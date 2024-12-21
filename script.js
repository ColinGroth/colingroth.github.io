window.addEventListener("scroll", function () {
  const headerInfo = document.querySelector(".profile-image-container");
    const navBar = document.querySelector(".nav-bar");

  // Check the bottom position of the header-image
  const headerBottom = headerInfo.getBoundingClientRect().top;

  if (headerBottom <= 0) {
	navBar.style.display = "flex";
  } else {
	navBar.style.display = "none";
  }
});

function toggleText() {
	const fullText = document.getElementById('intro-full');
	const button = document.getElementById('toggle-button');
	
	if (fullText.style.display === 'none') {
		fullText.style.display = 'block';
		button.textContent = 'Less';
	} else {
		fullText.style.display = 'none';
		button.textContent = 'More';
	}
}


//
// front page animation
//

// Set up scene, camera, and renderer for front-animation canvas
const canvasFront = document.getElementById('front-animation');
const renderer = new THREE.WebGLRenderer({ canvas: canvasFront });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// Create a regular tetrahedron geometry (all edges same length)
const geometry = new THREE.BufferGeometry();
const sqrt2 = Math.sqrt(2) / 2;
const vertices = new Float32Array([
	0.0, 1.0, 0.0,          // Top vertex
	-sqrt2, -0.5, -sqrt2,   // Bottom left
	 sqrt2, -0.5, -sqrt2,   // Bottom right
	 0.0, -0.5, sqrt2      // Bottom front
]);

const indices = [
	0, 1, 2,  // Side 1
	0, 2, 3,  // Side 2
	0, 3, 1,  // Side 3
	1, 3, 2   // Base
];

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setIndex(indices);
geometry.computeVertexNormals();

const material = new THREE.ShaderMaterial({
	uniforms: {
		time: { value: 0.0 },
	},
	vertexShader: `
		varying vec3 vPosition;
		void main() {
			vPosition = position;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	fragmentShader: `
		uniform float time;
		varying vec3 vPosition;
		void main() {
			float glow = abs(sin(time + length(vPosition)));
			gl_FragColor = vec4(vPosition.x + 0.5, glow, vPosition.y + 0.5, 1.0);
		}
	`,
	side: THREE.DoubleSide
});

const pyramid = new THREE.Mesh(geometry, material);
scene.add(pyramid);

// Animation loop
function animate(time) {
	time *= 0.001; // Convert time to seconds
	material.uniforms.time.value = time;
	pyramid.rotation.y += 0.01;
	pyramid.rotation.x += 0.005;
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});


//
// Node animation
//

    const canvas = document.getElementById('background');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate random points
    const nodes = Array.from({ length: 250 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      neighbors: [], // Current neighbors with their strengths
    }));

    // Function to calculate the Euclidean distance
    function distance(p1, p2) {
      return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    // Update neighbors for smooth transitions
    function updateNeighbors() {
      nodes.forEach(node => {
        // Calculate distances to all other nodes
        const distances = nodes.map((otherNode, otherIndex) => ({
          index: otherIndex,
          dist: distance(node, otherNode),
        }));

        // Sort by distance and get the 3 nearest neighbors
        distances.sort((a, b) => a.dist - b.dist);
        const targetNeighbors = distances.slice(1, 4).map(({ index }) => index); // Skip itself

        // Update neighbors with smooth transitions
        const newNeighbors = [];
        targetNeighbors.forEach(target => {
          const existing = node.neighbors.find(n => n.index === target);
          if (existing) {
            // Increment strength for existing neighbors
            existing.strength = Math.min(existing.strength + 0.05, 1);
            newNeighbors.push(existing);
          } else {
            // Add new neighbor with initial strength
            newNeighbors.push({ index: target, strength: 0 });
          }
        });

        // Fade out old neighbors
        node.neighbors.forEach(n => {
          if (!targetNeighbors.includes(n.index)) {
            n.strength = Math.max(n.strength - 0.05, 0);
            if (n.strength > 0) {
              newNeighbors.push(n);
            }
          }
        });

        node.neighbors = newNeighbors;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections with smooth transitions
      nodes.forEach(node => {
        node.neighbors.forEach(neighbor => {
          const targetNode = nodes[neighbor.index];
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${neighbor.strength})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
      });

      // Draw points
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        ctx.closePath();
      });

      // Update positions
      nodes.forEach(node => {
        node.x += node.dx;
        node.y += node.dy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.dx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.dy *= -1;
      });

      updateNeighbors();
      requestAnimationFrame(draw);
    }

    draw();

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });



	
//
// timeline
//

const timeline = document.querySelector('.experience-timeline');
const stages = document.querySelectorAll('.stage');
const leftArrow = document.querySelector('.timeline-arrow.left');
const rightArrow = document.querySelector('.timeline-arrow.right');

// Set currentIndex based on the initially active element
let currentIndex = Array.from(stages).findIndex(stage => stage.classList.contains('active'));

// Fallback to 0 if no stage is marked as active
if (currentIndex === -1) currentIndex = 1;

// Function to scroll to the active element
function scrollToActive(shouldScroll = true) {
    if (shouldScroll) {
        stages[currentIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
        });
    }

    // Update active class
    stages.forEach((stage, index) => {
        stage.classList.toggle('active', index === currentIndex);
    });
}

// Left arrow functionality
leftArrow.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        scrollToActive();
    }
});

rightArrow.addEventListener('click', () => {
    if (currentIndex < stages.length - 1) {
        currentIndex++;
        scrollToActive();
    }
});

// Initial setup without scrolling
scrollToActive(false);



//// animated lines
const svg = document.querySelector('.timeline-svg');
const container = document.querySelector('.timeline-container');
let phase = 0; // Phase for the sine wave

function createSinePath(startX, startY, endX, endY, phase) {
    const wavePoints = 15; // Number of wave points
    const amplitude = 40; // Amplitude of the sine wave
    const frequency = 3; // Frequency of the sine wave

    const path = [`M${startX},${startY}`];
    for (let i = 1; i <= wavePoints; i++) {
        const t = i / wavePoints; // Interpolation factor (0 to 1)
        const x = startX + t * (endX - startX);
        const y =
            startY +
            t * (endY - startY) +
            Math.sin(2 * Math.PI * (frequency * t + phase)) * amplitude;

        path.push(`L${x},${y}`);
    }
    path.push(`L${endX},${endY}`);
    return path.join(' ');
}

function generateConnections() {
    svg.innerHTML = '';
    document.querySelectorAll('.year-label').forEach(label => label.remove()); // Remove old year labels
    const containerRect = container.getBoundingClientRect();

    for (let i = 0; i < stages.length - 1; i++) {
        const currentStageRect = stages[i].getBoundingClientRect();
        const nextStageRect = stages[i + 1].getBoundingClientRect();

        // Calculate positions relative to the container
        const currentX = currentStageRect.right - currentStageRect.width / 2 - containerRect.left;
        const currentY = currentStageRect.top + currentStageRect.height / 2 - containerRect.top;
        const nextX = nextStageRect.left + nextStageRect.width / 2 - containerRect.left;
        const nextY = nextStageRect.top + nextStageRect.height / 2 - containerRect.top;

        // Create SVG sine wave path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', createSinePath(currentX, currentY, nextX, nextY, phase));
        path.setAttribute('stroke', '#82aef1');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);

        // Add year label based on the stage defining it
        const year = stages[i].dataset.year;
        if (year) {
            const yearLabel = document.createElement('div');
            yearLabel.className = 'year-label';
            yearLabel.innerText = year;

            // Position the year label at the midpoint between current and next stage
            const midX = (currentX + nextX) / 2;
            const midY = (currentY + nextY) / 2;
            yearLabel.style.left = `${midX}px`;
            yearLabel.style.top = `${midY}px`;

            container.appendChild(yearLabel);
        }
    }
}


// Animate sine wave by updating phase
function animateSineWave() {
    phase += 0.005; // Increment phase to create movement
    generateConnections();
    requestAnimationFrame(animateSineWave); // Loop animation
}

// Attach scroll and resize events
timeline.addEventListener('scroll', generateConnections);
window.addEventListener('resize', generateConnections);
window.addEventListener('load', () => {
    generateConnections();
    animateSineWave();
});




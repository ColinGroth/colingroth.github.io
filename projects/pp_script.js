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

      //// Update positions
      //nodes.forEach(node => {
      //  node.x += node.dx;
      //  node.y += node.dy;
	  //
      //  // Bounce off edges
      //  if (node.x < 0 || node.x > canvas.width) node.dx *= -1;
      //  if (node.y < 0 || node.y > canvas.height) node.dy *= -1;
      //});

      updateNeighbors();
      requestAnimationFrame(draw);
    }

    draw();

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
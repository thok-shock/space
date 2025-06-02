import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Bullet from './bullet'
import Enemy from './Enemy'
//import useSound from './useSound'
import laserSoundFile from './assets/laser.mp3'
import explosionSoundFile from './assets/explosion.mp3'
import {Howl} from 'howler'
import { useInput } from './useInput';

const laserSound = new Howl({
  src: laserSoundFile,
  volume: 0.5
});

const explosionSound = new Howl({
  src: explosionSoundFile,
  volume: 0.5
});

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function App() {


  //const playLaser = useSound(laserSound, 0.5)
  //const playExplosion = useSound(explosionSound, 0.5)
  const [playerX, setPlayerX] = useState(10)
  const gameAreaRef = useRef(null)
  const [gameWidth, setGameWidth] = useState(0)
  const PLAYER_WIDTH = 15
  const PLAYER_HEIGHT = 15
  const BULLET_WIDTH = 5
  const BULLET_HEIGHT = 15
  const ENEMY_HEIGHT = 40
  const ENEMY_WIDTH = 40
  const [bullets, setBullets] = useState([])
  const [enemies, setEnemies] = useState([])
  const [spawnTime, setSpawnTime] = useState(250)
  const enemiesRef = useRef([])
  const [explosions, setExplosions] = useState([])
  const [score, setScore] = useState(0)

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies])


  //manage key presses
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     //move left
  //     if (e.code === "ArrowLeft") {
  //       setPlayerX(prev => Math.max(prev - 15, 10))
  //     }
  //     //move right
  //     if (e.code === "ArrowRight") {
  //       setPlayerX(prev => Math.min(prev + 15, (gameWidth - PLAYER_WIDTH) - 10))
  //     }
  //     //shoot
  //     if (e.code === "Space") {
  //       console.log('pew')
  //       laserSound.play()
  //       setBullets(prevBullets => [...prevBullets, {
  //         x: playerX + PLAYER_WIDTH / 2 - 2,
  //         y: 40
  //       }])
  //     }
  //   }

  //   //listen for keys to be pressed
  //   window.addEventListener('keydown', handleKeyDown)
  //   return () => window.removeEventListener('keydown', handleKeyDown)
  // }, [gameWidth, playerX])

  useInput({
    onMoveLeft: () => setPlayerX(prev => Math.max(prev - 5, 0)),
    onMoveRight: () => setPlayerX(prev => Math.min(prev + 5, gameWidth - PLAYER_WIDTH)),
    onShoot: () => {
      laserSound.play(); // if using howler
      setBullets(prev => [...prev, {
        x: playerX + PLAYER_WIDTH / 2 - 2,
        y: 40,
      }]);
    }
  });

  //update window width so that game is not a hard-coded width
  useEffect(() => {
    const updateGameWidth = () => {
      if (gameAreaRef.current) {
        const width = gameAreaRef.current.offsetWidth; //grabs width from window?? i pray
        setGameWidth(width)
        setPlayerX((width - PLAYER_WIDTH) / 2) //centering
      }
    }

    updateGameWidth()
    window.addEventListener('resize', updateGameWidth)

    return () => window.removeEventListener('resize', updateGameWidth)
  }, [])

  //make bullets move and detect collisions
  useEffect(() => {
    const interval = setInterval(() => {

      setBullets(prevBullets => {
        let updatedBullets = [];
        let enemiesToRemove = new Set();

        const newBullets = prevBullets.map(bullet => {
          const moved = { ...bullet, y: bullet.y + 10 };

          // Check collision with each enemy
          enemiesRef.current.forEach(enemy => {
            const collided =
              moved.x < enemy.x + ENEMY_WIDTH &&
              moved.x + BULLET_WIDTH > enemy.x &&
              moved.y < enemy.y + ENEMY_HEIGHT &&
              moved.y + BULLET_HEIGHT > enemy.y;

            if (collided) {
              console.log('boom')
              enemiesToRemove.add(enemy.id);
              setScore(prev => prev + 100)
              //add explosion
              explosionSound.play()
              setExplosions(prev => [...prev, {
                id: Math.random() * 100,
                x: enemy.x,
                y: enemy.y
              }])
            }
          });

          return moved;
        });

        updatedBullets = newBullets.filter(bullet => {
          const hitEnemy = Array.from(enemiesToRemove).some(id => {
            return enemiesRef.current.find(e => e.id === id && isColliding(
              {
                x: bullet.x,
                y: bullet.y,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT
              },
              {
                x: enemiesRef.current.find(e => e.id === id).x,
                y: enemiesRef.current.find(e => e.id === id).y,
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT
              }
            ));
          });

          return bullet.y < 1000 && !hitEnemy;
        });

        // Remove collided enemies
        if (enemiesToRemove.size > 0) {
          setEnemies(prev =>
            prev.filter(enemy => !enemiesToRemove.has(enemy.id))
          );
        }

        return updatedBullets;
      });
    }, 50)



    return () => clearInterval(interval)
  }, [])

  //do explosions
  useEffect(() => {
    if (explosions.length === 0) return;

    const timeout = setTimeout(() => {
      setExplosions(prev => prev.slice(1));
    }, 200); // Adjust for CSS animation duration

    return () => clearTimeout(timeout);
  }, [explosions]);

  //move enemies down the screen
  useEffect(() => {
    const interval = setInterval(() => {
      setEnemies(prev =>
        prev
          .map(enemy => ({ ...enemy, y: enemy.y - 2.5 })) // move down
          .filter(enemy => enemy.y > 0) // remove if off screen
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  //spawn enemies
  useEffect(() => {
    const spawnEnemy = () => {
      const x = Math.floor(Math.random() * (gameWidth - ENEMY_WIDTH))
      setEnemies(prev => [
        ...prev,
        { id: Date.now() + Math.random(), x, y: 1000 }
      ])
    }
    const spawnInterval = setInterval(spawnEnemy, spawnTime)

    return () => clearInterval(spawnInterval)
  }, [gameWidth, spawnTime])

  return (
    <>
      <div className='game-area' ref={gameAreaRef}>
        
        {/**bullets */}
        {bullets && bullets.length > 0 && bullets.map((bullet, i) => {
          return <Bullet {...bullet} key={i} />
        })}
        {/**enemies */}
        {enemies.map((enemy) => {
          return <Enemy {...enemy} key={enemy.id} />
        })}
        {/**explosions */}
        {explosions.map((exp) => (
          <div
            key={exp.id}
            className="explosion"
            style={{ left: exp.x, bottom: exp.y }}
          />
        ))}
        {/**player */}
        <div className='player' style={{ position: 'absolute', left: playerX, bottom: '20px' }}></div>
        <div className='score-display'>Score: {score}</div>
        <div className='creator'>Created by Ryan S Werner</div>
      </div>
    </>
  )
}

export default App

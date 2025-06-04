import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Bullet from './bullet'
import Enemy from './Enemy'
//import useSound from './useSound'
import laserSoundFile from './assets/laser.mp3'
import explosionSoundFile from './assets/explosion.mp3'
import panicSoundFile from './assets/panic.mp3'
import { Howl } from 'howler'
import { useInput } from './useInput';
import { powerups } from './powerups'
import PowerupModal from './PowerupModal'
import { Button } from 'react-bootstrap'
import HealthBar from './HealthBar'

const laserSound = new Howl({
  src: laserSoundFile,
  volume: 0.5
});

const explosionSound = new Howl({
  src: explosionSoundFile,
  volume: 0.5
});

const panicSound = new Howl({
  src: panicSoundFile,
  volume: 0.2
})

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
  const [baseSpawnTime, setBaseSpawnTime] = useState(1000)
  const [spawnTime, setSpawnTime] = useState(0)
  const [baseEnemySpeed, setBaseEnemySpeed] = useState(7.5)
  const [enemySpeed, setEnemySpeed] = useState(0)
  const enemiesRef = useRef([])
  const [explosions, setExplosions] = useState([])
  const [score, setScore] = useState(0)
  const [paused, setPaused] = useState(false)
  const [bulletsFired, setBulletsFired] = useState(0)
  const [enemiesEliminated, setEnemiesEliminated] = useState(0)
  const bulletIntervalRef = useRef(null)
  const [currency, setCurrency] = useState(0)
  const [displayPowerups, setDisplayPowerups] = useState(false)
  const [purchased, setPurchased] = useState({})
  const [health, setHealth] = useState(80)
  const [playerSpeed, setPlayerSpeed] = useState(5)

  //handle purchasing of powerups
  const handleBuy = (powerup) => {
    if (currency >= powerup.cost && !purchased[powerup.id]) {
      setCurrency(prev => prev - powerup.cost);
      setPurchased(prev => ({ ...prev, [powerup.id]: true }));
      // TODO: Apply powerup effect here
    }
  };

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies])

  useEffect(() => {
    if (displayPowerups) setPaused(true);
     else {
      setPaused(false)
    }
  }, [displayPowerups])

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


  //change spawn rate based on game width
  //currently not changing anything, i confused spawn time with movement speed lol
  useEffect(() => {
    const rate = baseSpawnTime
    setSpawnTime(rate)
  }, [gameWidth, baseSpawnTime])

  useEffect(() => {
    const speed = baseEnemySpeed * (1000 / gameWidth)
    setEnemySpeed(speed)
  }, [baseEnemySpeed, gameWidth])

  //handle escape keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        setPaused(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  //listen for visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPaused(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  //make movement smoother
  useInput({
    onMoveLeft: () => setPlayerX(prev => Math.max(prev - playerSpeed, 0)),
    onMoveRight: () => setPlayerX(prev => Math.min(prev + playerSpeed, gameWidth - PLAYER_WIDTH)),
    onShoot: () => {
      laserSound.play(); // if using howler
      
      if (purchased.shotgun) {
        setBullets(prev => [...prev, {
          x: playerX - 15 + PLAYER_WIDTH / 2 - 2,
          y: 40,
        },
        {
          x: playerX + PLAYER_WIDTH / 2 - 2,
          y: 40,
        },
        {
          x: playerX + 15  + PLAYER_WIDTH / 2 - 2,
          y: 40,
        }]);
        setCurrency(prev => prev - 3)
        setBulletsFired(prev => prev + 3)
      } else {
        setCurrency(prev => prev - 1)
        setBulletsFired(prev => prev + 1)
      setBullets(prev => [...prev, {
        x: playerX + PLAYER_WIDTH / 2 - 2,
        y: 40,
      }]);
    }
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
    //console.log("Bullet interval setting up");
    if (bulletIntervalRef.current) return;
    if (paused) return;

    bulletIntervalRef.current = setInterval(() => {
      //console.log("Bullet interval running");
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
              setCurrency(prev => prev + 10)
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
          //console.log(enemiesToRemove)
          setEnemiesEliminated(prev => prev + enemiesToRemove.size)
          setEnemies(prev =>
            prev.filter(enemy => !enemiesToRemove.has(enemy.id))
          );
        }

        return updatedBullets;
      });
    }, 50)



    return () => { clearInterval(bulletIntervalRef.current); bulletIntervalRef.current = null; console.log("Bullet interval cleared"); }
  }, [paused])

  //do explosions
  useEffect(() => {
    if (explosions.length === 0) return;

    const timeout = setTimeout(() => {
      setExplosions(prev => prev.slice(1));
    }, 100); // Adjust for CSS animation duration

    return () => clearTimeout(timeout);
  }, [explosions]);

  //move enemies down the screen
  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setEnemies(prevEnemies => {
        const updatedEnemies = [];
        prevEnemies.forEach(enemy => {
          const newY = enemy.y - enemySpeed;
          if (newY > 0) {
            updatedEnemies.push({ ...enemy, y: newY });
          } else {
            // Enemy reached the bottom — damage player
            setHealth(h => Math.max(h - 5, 0)); // Adjust damage as needed
            //triggerExplosion(enemy.x, 0, 'danger'); // Scary explosion effect
            explosionSound.play()
            panicSound.play()
              setExplosions(prev => [...prev, {
                id: Math.random() * 100,
                x: enemy.x,
                y: enemy.y
              }])
          }
        });
        return updatedEnemies;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [paused, enemySpeed]);

  //spawn enemies
  useEffect(() => {
    if (paused) return
    const spawnEnemy = () => {
      const x = Math.floor(Math.random() * (gameWidth - ENEMY_WIDTH))
      setEnemies(prev => [
        ...prev,
        { id: Date.now() + Math.random(), x, y: 1000 }
      ])
    }
    const spawnInterval = setInterval(spawnEnemy, spawnTime)

    return () => clearInterval(spawnInterval)
  }, [gameWidth, spawnTime, paused])

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      if (health < 100) {
        setHealth(prev => prev + 1)
      }
    }, 1000)

    return () => clearInterval(interval)

  }, [paused])

  return (
    <>
      <PowerupModal
        show={displayPowerups}
        onClose={() => setDisplayPowerups(false)}
        currency={currency}
        powerups={powerups}
        purchased={purchased}
        onBuy={handleBuy}
      />
      <div className='game-area' ref={gameAreaRef}>
        {paused && !displayPowerups && <div className='pause-menu'>
          <h3>GAME PAUSED</h3>
          <Button onClick={() => { setPaused(false) }}>Continue Game</Button>
        </div>}

        {/**bullets */}
        {bullets && bullets.length > 0 && bullets.map((bullet, i) => {
          return <Bullet {...bullet} key={i} />
        })}
        {/**enemies */}
        {enemies.map((enemy) => {
          return <Enemy {...enemy} enemySpeed={enemySpeed} key={enemy.id} />
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
        {purchased.sights && <div className='sights' style={{position: 'absolute', left: playerX + PLAYER_WIDTH / 2, bottom: '40px'}}></div>}
        <div className='bottom-ui'>
          <div className='ui-section'></div>
          <div className='ui-section'></div>
          <button className='ui-section' id='upgrade-button' onClick={() => setDisplayPowerups(true)}>Upgrades</button>
          <HealthBar className='ui-section' health={health} maxHealth={100} />

        </div>
        <div className='legend'>
          <h5>Xorglon Defense</h5>
        <div className='score-display'>Score: {score}</div>
        <div>Bullets Fired: {bulletsFired}</div>
        <div>Enemies Eliminated: {enemiesEliminated}</div>
        <div >Money: <span className='currency' style={currency > 0 ? { color: 'lightgreen' } : { color: 'red' }}>{currency}</span></div>
        {/* <div id='debug-menu'>
          <br />
          <h5>Debug Menu</h5>
          <button onClick={() => {setCurrency(prev => prev + 1000)}}>Add money</button>
          <div>
            <label>Spawn Delay (ms)</label>
            <input type='number' value={spawnTime} onChange={(e) => {setSpawnTime(e.target.value)}}></input>
          </div>
          <div>
            <label>Enemy Movement Speed (ms)</label>
            <input type='number' value={enemySpeed} onChange={(e) => {setEnemySpeed(e.target.value)}}></input>
          </div>
        </div> */}
        </div>
        <div className='creator'>Created by Ryan S Werner</div>
      </div>
    </>
  )
}

export default App

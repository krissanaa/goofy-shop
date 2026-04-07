"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import Matter from "matter-js"

const LETTERS = ["G", "O", "O", "F", "Y", "S", "K", "A", "T", "E"]
const LETTER_WIDTH = 40
const LETTER_HEIGHT = 60
const BOARD_WIDTH = 158
const BOARD_HEIGHT = 20
const WHEEL_RADIUS = 14
const BOARD_RIDE_HEIGHT = 54
const HOLD_DURATION_MS = 340
const FIRST_HOLD_DURATION_MS = 650
const JUMP_DURATION_MS = 460
const LOOP_DELAY_MS = 1200

type TrickProfile = {
  name: string
  arcBoost: number
  durationOffset: number
  spinAmplitude: number
  spinCycles: number
  tiltAmplitude: number
  travelBias: number
  wheelLift: number
  wheelSpread: number
}

type BoardRig = {
  deck: Matter.Body
  wheels: [Matter.Body, Matter.Body]
}

const TRICK_PROFILES: TrickProfile[] = [
  {
    name: "ollie",
    arcBoost: 14,
    durationOffset: -10,
    spinAmplitude: 0.1,
    spinCycles: 1,
    tiltAmplitude: 0.26,
    travelBias: 0,
    wheelLift: 0,
    wheelSpread: 0,
  },
  {
    name: "kickflip",
    arcBoost: 24,
    durationOffset: 26,
    spinAmplitude: 1.18,
    spinCycles: 2.9,
    tiltAmplitude: 0.14,
    travelBias: 6,
    wheelLift: 10,
    wheelSpread: 10,
  },
  {
    name: "kickflip180",
    arcBoost: 28,
    durationOffset: 44,
    spinAmplitude: 1.46,
    spinCycles: 3.6,
    tiltAmplitude: 0.08,
    travelBias: 10,
    wheelLift: 12,
    wheelSpread: 14,
  },
  {
    name: "heelflip",
    arcBoost: 26,
    durationOffset: 30,
    spinAmplitude: -1.08,
    spinCycles: 2.7,
    tiltAmplitude: -0.12,
    travelBias: 6,
    wheelLift: 10,
    wheelSpread: 11,
  },
  {
    name: "nollie",
    arcBoost: 20,
    durationOffset: 8,
    spinAmplitude: 0.22,
    spinCycles: 1.2,
    tiltAmplitude: -0.26,
    travelBias: 3,
    wheelLift: 2,
    wheelSpread: 2,
  },
  {
    name: "popshuvit",
    arcBoost: 18,
    durationOffset: 18,
    spinAmplitude: 0.82,
    spinCycles: 1.9,
    tiltAmplitude: 0.1,
    travelBias: 9,
    wheelLift: 5,
    wheelSpread: 7,
  },
  {
    name: "frontside180",
    arcBoost: 22,
    durationOffset: 24,
    spinAmplitude: 0.58,
    spinCycles: 1.35,
    tiltAmplitude: 0.18,
    travelBias: 7,
    wheelLift: 6,
    wheelSpread: 5,
  },
]

export default function PhysicsHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const engineRef = useRef<Matter.Engine | null>(null)
  const deckRef = useRef<Matter.Body | null>(null)
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replayRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) {
      return
    }

    const { Engine, Render, Runner, Bodies, Body, World, Events, Composite } = Matter

    const clearResetTimeout = () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
        resetTimeoutRef.current = null
      }
    }

    const engine = Engine.create({ gravity: { x: 0, y: 0 } })
    engineRef.current = engine

    const updateDimensions = () => ({
      width: containerRef.current?.offsetWidth || window.innerWidth,
      height: containerRef.current?.offsetHeight || 600,
    })

    let { width, height } = updateDimensions()
    let letterBodies: Matter.Body[] = []
    let revealedCount = 1
    let phase:
      | "introHold"
      | "introJump"
      | "introFail"
      | "secondHold"
      | "secondJump"
      | "complete" = "introHold"
    let phaseStartedAt = 0
    let currentTrick = TRICK_PROFILES[0]
    let lastTrickName = ""
    let introIndex = 0
    let secondIndex = 2
    let jumpFromIndex = 0
    let jumpToIndex = 1
    let boardOne: BoardRig | null = null
    let boardTwo: BoardRig | null = null
    let introFailPose = { x: 0, y: 0, angle: 0 }
    let introFailTargetX = 0

    const render = Render.create({
      canvas: canvasRef.current,
      engine,
      options: {
        width,
        height,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio || 1,
      },
    })

    const letterMap = new Map<number, { char: string; index: number }>()

    const getLetterLayout = () => {
      const spacing = Math.min(Math.max(width * 0.066, 62), 92)
      const totalWidth = spacing * (LETTERS.length - 1)
      const startX = (width - totalWidth) / 2
      const baseY = height * 0.62

      return LETTERS.map((char, index) => {
        const progress = index / (LETTERS.length - 1)
        const x = startX + index * spacing
        const y = baseY + progress * 16 - Math.sin(progress * Math.PI) * 10
        return { char, index, x, y }
      })
    }

    const positionBoard = (
      board: BoardRig,
      x: number,
      y: number,
      angle: number,
      wheelOffsetY = 15,
      wheelOffsetX = 52,
    ) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const rotateOffset = (offsetX: number, offsetY: number) => ({
        x: x + offsetX * cos - offsetY * sin,
        y: y + offsetX * sin + offsetY * cos,
      })

      Body.setPosition(board.deck, { x, y })
      Body.setAngle(board.deck, angle)
      Body.setVelocity(board.deck, { x: 0, y: 0 })
      Body.setAngularVelocity(board.deck, 0)

      const leftWheel = rotateOffset(-wheelOffsetX, wheelOffsetY)
      const rightWheel = rotateOffset(wheelOffsetX, wheelOffsetY)

      Body.setPosition(board.wheels[0], leftWheel)
      Body.setPosition(board.wheels[1], rightWheel)
      Body.setVelocity(board.wheels[0], { x: 0, y: 0 })
      Body.setVelocity(board.wheels[1], { x: 0, y: 0 })
      Body.setAngularVelocity(board.wheels[0], 0)
      Body.setAngularVelocity(board.wheels[1], 0)
    }

    const hideBoard = (board: BoardRig) => {
      positionBoard(board, -1000, -1000, 0)
    }

    const getBoardPose = (index: number) => {
      const current = letterBodies[index]
      const next = letterBodies[index + 1] ?? current
      const angle = Math.atan2(next.position.y - current.position.y, next.position.x - current.position.x) * 0.42

      return {
        x: current.position.x + 8,
        y: current.position.y - BOARD_RIDE_HEIGHT,
        angle,
      }
    }

    const pickRandomTrick = () => {
      if (TRICK_PROFILES.length === 1) {
        return TRICK_PROFILES[0]
      }

      let selected = TRICK_PROFILES[Math.floor(Math.random() * TRICK_PROFILES.length)]
      let attempts = 0
      while (selected.name === lastTrickName && attempts < 6) {
        selected = TRICK_PROFILES[Math.floor(Math.random() * TRICK_PROFILES.length)]
        attempts += 1
      }

      lastTrickName = selected.name
      return selected
    }

    const handleAfterRender = () => {
      const ctx = render.context
      const beamSourceX = width / 2
      const lightX = deckRef.current ? deckRef.current.position.x : -999

      ctx.save()
      ctx.font = "italic 900 64px 'Barlow Condensed', sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      if (deckRef.current) {
        ctx.save()
        const beamGrad = ctx.createLinearGradient(beamSourceX, 0, lightX, height)
        beamGrad.addColorStop(0, "rgba(255, 232, 160, 0.18)")
        beamGrad.addColorStop(0.45, "rgba(238,58,36, 0.14)")
        beamGrad.addColorStop(1, "rgba(238,58,36, 0)")

        ctx.fillStyle = beamGrad
        ctx.beginPath()
        ctx.moveTo(beamSourceX - 46, 0)
        ctx.lineTo(beamSourceX + 46, 0)
        ctx.lineTo(lightX + 250, height)
        ctx.lineTo(lightX - 250, height)
        ctx.closePath()
        ctx.fill()

        ctx.globalCompositeOperation = "destination-out"
        Composite.allBodies(engine.world)
          .filter((body) => body.label.startsWith("skateboard_"))
          .forEach((body) => {
            ctx.beginPath()

            if (body.circleRadius) {
              ctx.arc(body.position.x, body.position.y, body.circleRadius + 2, 0, Math.PI * 2)
            } else {
              ctx.moveTo(body.vertices[0].x, body.vertices[0].y)
              for (let i = 1; i < body.vertices.length; i++) {
                ctx.lineTo(body.vertices[i].x, body.vertices[i].y)
              }
              ctx.closePath()
            }

            ctx.fill()
          })
        ctx.restore()
      }

      letterBodies.forEach((body) => {
        const letter = letterMap.get(body.id)
        if (!letter || letter.index >= revealedCount) {
          return
        }

        const opacity = letter.index === revealedCount - 1 ? 1 : 0.24

        ctx.save()
        ctx.translate(body.position.x, body.position.y)
        ctx.rotate(body.angle)
        ctx.fillStyle = `rgba(244, 240, 235, ${opacity})`
        ctx.fillText(letter.char, 0, 0)
        ctx.restore()
      })

      ctx.restore()
    }

    const buildScene = () => {
      clearResetTimeout()

      Composite.allBodies(engine.world).forEach((body) => {
        World.remove(engine.world, body)
      })
      Composite.allConstraints(engine.world).forEach((constraint) => {
        World.remove(engine.world, constraint)
      })

      letterMap.clear()
      letterBodies = []
      deckRef.current = null

      revealedCount = 1
      introIndex = 0
      secondIndex = 2
      jumpFromIndex = 0
      jumpToIndex = 1
      phase = "introHold"
      phaseStartedAt = engine.timing.timestamp
      currentTrick = TRICK_PROFILES[0]
      lastTrickName = ""
      boardOne = null
      boardTwo = null
      introFailPose = { x: 0, y: 0, angle: 0 }
      introFailTargetX = 0

      const layout = getLetterLayout()
      letterBodies = layout.map(({ char, index, x, y }) => {
        const body = Bodies.rectangle(x, y, LETTER_WIDTH, LETTER_HEIGHT, {
          isStatic: true,
          render: { fillStyle: "transparent", strokeStyle: "transparent" },
          label: `letter_${char}`,
        })
        letterMap.set(body.id, { char, index })
        return body
      })

      const deckOne = Bodies.rectangle(0, 0, BOARD_WIDTH, BOARD_HEIGHT, {
        isStatic: true,
        chamfer: { radius: 10 },
        render: { fillStyle: "#EE3A24" },
        label: "skateboard_one_deck",
      })
      const wheelOneL = Bodies.circle(0, 0, WHEEL_RADIUS, {
        isStatic: true,
        render: { fillStyle: "#F4F0EB" },
        label: "skateboard_one_wheel_left",
      })
      const wheelOneR = Bodies.circle(0, 0, WHEEL_RADIUS, {
        isStatic: true,
        render: { fillStyle: "#F4F0EB" },
        label: "skateboard_one_wheel_right",
      })
      const deckTwo = Bodies.rectangle(0, 0, BOARD_WIDTH, BOARD_HEIGHT, {
        isStatic: true,
        chamfer: { radius: 10 },
        render: { fillStyle: "#EE3A24" },
        label: "skateboard_two_deck",
      })
      const wheelTwoL = Bodies.circle(0, 0, WHEEL_RADIUS, {
        isStatic: true,
        render: { fillStyle: "#F4F0EB" },
        label: "skateboard_two_wheel_left",
      })
      const wheelTwoR = Bodies.circle(0, 0, WHEEL_RADIUS, {
        isStatic: true,
        render: { fillStyle: "#F4F0EB" },
        label: "skateboard_two_wheel_right",
      })

      boardOne = {
        deck: deckOne,
        wheels: [wheelOneL, wheelOneR],
      }
      boardTwo = {
        deck: deckTwo,
        wheels: [wheelTwoL, wheelTwoR],
      }
      deckRef.current = boardOne.deck

      World.add(engine.world, [
        ...letterBodies,
        boardOne.deck,
        ...boardOne.wheels,
        boardTwo.deck,
        ...boardTwo.wheels,
      ])

      const firstPose = getBoardPose(0)
      positionBoard(boardOne, firstPose.x, firstPose.y, firstPose.angle)
      hideBoard(boardTwo)
    }

    replayRef.current = buildScene

    const handleAfterUpdate = () => {
      if (!deckRef.current || letterBodies.length === 0 || !boardOne || !boardTwo) {
        return
      }

      const now = engine.timing.timestamp

      if (phase === "introHold") {
        const holdDuration = introIndex === 0 ? FIRST_HOLD_DURATION_MS : HOLD_DURATION_MS
        const pose = getBoardPose(introIndex)
        positionBoard(boardOne, pose.x, pose.y, pose.angle)
        deckRef.current = boardOne.deck

        if (now - phaseStartedAt >= holdDuration) {
          if (introIndex < 2) {
            jumpFromIndex = introIndex
            jumpToIndex = introIndex + 1
            phase = "introJump"
            phaseStartedAt = now
            return
          }

          introFailPose = pose
          introFailTargetX = getBoardPose(3).x + 28
          phase = "introFail"
          phaseStartedAt = now
        }

        return
      }

      if (phase === "introJump") {
        const fromPose = getBoardPose(jumpFromIndex)
        const toPose = getBoardPose(jumpToIndex)
        const t = Math.min(1, (now - phaseStartedAt) / (JUMP_DURATION_MS - 40))
        const eased = 1 - Math.pow(1 - t, 2)
        const wave = Math.sin(Math.PI * t)
        const x = fromPose.x + (toPose.x - fromPose.x) * eased
        const y = fromPose.y + (toPose.y - fromPose.y) * eased - wave * 58
        const angle = fromPose.angle + (toPose.angle - fromPose.angle) * eased - wave * 0.18

        positionBoard(boardOne, x, y, angle)
        deckRef.current = boardOne.deck

        if (t >= 1) {
          introIndex = jumpToIndex
          revealedCount = Math.max(revealedCount, introIndex + 1)
          phase = "introHold"
          phaseStartedAt = now
        }

        return
      }

      if (phase === "introFail") {
        const t = Math.min(1, (now - phaseStartedAt) / 720)
        const eased = 1 - Math.pow(1 - t, 2)
        const arc = Math.sin(Math.PI * Math.min(t, 0.46) / 0.46) * 66
        const x = introFailPose.x + (introFailTargetX - introFailPose.x) * eased
        const y = introFailPose.y - arc + Math.pow(t, 1.55) * height * 0.82
        const angle = introFailPose.angle - t * 1.3
        const wheelLift = 15 + Math.sin(Math.PI * t) * 8
        const wheelSpread = 52 + Math.sin(Math.PI * t) * 6

        positionBoard(boardOne, x, y, angle, wheelLift, wheelSpread)
        deckRef.current = boardOne.deck

        if (t >= 1) {
          hideBoard(boardOne)
          const secondPose = getBoardPose(secondIndex)
          positionBoard(boardTwo, secondPose.x, secondPose.y, secondPose.angle)
          deckRef.current = boardTwo.deck
          phase = "secondHold"
          phaseStartedAt = now
        }

        return
      }

      if (phase === "secondHold") {
        const holdDuration = secondIndex === 2 ? HOLD_DURATION_MS + 140 : HOLD_DURATION_MS
        const pose = getBoardPose(secondIndex)
        positionBoard(boardTwo, pose.x, pose.y, pose.angle)
        deckRef.current = boardTwo.deck

        if (secondIndex >= letterBodies.length - 1) {
          phase = "complete"
          phaseStartedAt = now
          clearResetTimeout()
          resetTimeoutRef.current = setTimeout(() => {
            buildScene()
          }, LOOP_DELAY_MS)
          return
        }

        if (now - phaseStartedAt >= holdDuration) {
          jumpFromIndex = secondIndex
          jumpToIndex = secondIndex + 1
          currentTrick = pickRandomTrick()
          phase = "secondJump"
          phaseStartedAt = now
        }

        return
      }

      if (phase === "secondJump") {
        const fromPose = getBoardPose(jumpFromIndex)
        const toPose = getBoardPose(jumpToIndex)
        const duration = JUMP_DURATION_MS + currentTrick.durationOffset
        const t = Math.min(1, (now - phaseStartedAt) / duration)
        const eased = 1 - Math.pow(1 - t, 2)
        const arcHeight =
          54 +
          Math.min(32, Math.abs(toPose.x - fromPose.x) * 0.16) +
          currentTrick.arcBoost
        const trickWave = Math.sin(Math.PI * t)
        const spinWave =
          Math.sin(Math.PI * t * currentTrick.spinCycles) * trickWave * currentTrick.spinAmplitude
        const tiltWave = trickWave * currentTrick.tiltAmplitude
        const wheelLift = 15 + trickWave * currentTrick.wheelLift
        const wheelSpread = 52 + trickWave * currentTrick.wheelSpread

        const x =
          fromPose.x +
          (toPose.x - fromPose.x) * eased +
          trickWave * currentTrick.travelBias
        const y = fromPose.y + (toPose.y - fromPose.y) * eased - Math.sin(Math.PI * t) * arcHeight
        const angle =
          fromPose.angle +
          (toPose.angle - fromPose.angle) * eased -
          trickWave * 0.28 +
          spinWave +
          tiltWave

        positionBoard(boardTwo, x, y, angle, wheelLift, wheelSpread)
        deckRef.current = boardTwo.deck

        if (t >= 1) {
          secondIndex = jumpToIndex
          revealedCount = Math.max(revealedCount, secondIndex + 1)
          phase = "secondHold"
          phaseStartedAt = now
        }
      }
    }

    buildScene()

    Events.on(render, "afterRender", handleAfterRender)
    Events.on(engine, "afterUpdate", handleAfterUpdate)

    const runner = Runner.create()
    Runner.run(runner, engine)
    Render.run(render)

    const handleResize = () => {
      const next = updateDimensions()
      width = next.width
      height = next.height
      Render.setPixelRatio(render, window.devicePixelRatio || 1)
      Render.setSize(render, width, height)
      buildScene()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      replayRef.current = null
      clearResetTimeout()
      window.removeEventListener("resize", handleResize)
      Events.off(render, "afterRender", handleAfterRender)
      Events.off(engine, "afterUpdate", handleAfterUpdate)
      Render.stop(render)
      Runner.stop(runner)
      Engine.clear(engine)
      World.clear(engine.world, false)
      engineRef.current = null
      deckRef.current = null
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[400px] w-full overflow-hidden bg-transparent md:min-h-[600px]"
    >
      <h1 className="sr-only">GOOFY SKATE - First Skateboard Shop in Laos</h1>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ zIndex: 1, touchAction: "pan-y" }}
      />
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute left-8 top-8">
          <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-[#EE3A24]">
            GOOFY. SKATE SHOP / VIENTIANE
          </span>
        </div>
        <button
          type="button"
          onClick={() => replayRef.current?.()}
          className="pointer-events-auto absolute right-8 top-8 cursor-pointer font-mono text-[8px] uppercase text-white/30 transition-colors hover:text-white/80"
        >
          Replay
        </button>
        <div className="absolute bottom-12 left-1/2 flex w-full -translate-x-1/2 flex-col items-center gap-6 px-4 md:bottom-24">
          <p className="font-mono text-center text-[9px] uppercase tracking-[0.18em] text-white/40">
            High quality parts for street skate
          </p>
          <div className="pointer-events-auto flex gap-4">
            <Link
              href="/shop"
              className="rounded-sm bg-[#EE3A24] px-6 py-3 text-xs font-bold uppercase tracking-wide text-[#0A0A0A] transition-colors hover:bg-[#F4F0EB]"
            >
              Shop All Parts
            </Link>
            <Link
              href="/drops"
              className="rounded-sm border border-white/20 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-[#0A0A0A]"
            >
              Latest Drop
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

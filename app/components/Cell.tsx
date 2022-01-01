import { useActor } from '@xstate/react'
import React from 'react'
import { createMachine, sendParent } from 'xstate'
import { pure } from 'xstate/lib/actions'

export const createCellMachine = (coords: [number, number], value: number | 'X') =>
  createMachine(
    {
      id: `cell-${coords.join('-')}`,
      initial: 'unrevealed',
      context: {
        coords,
        value
      },
      states: {
        unrevealed: {
          on: {
            CLICK: {
              target: 'revealed',
              actions: 'reveal'
            },
            REVEAL: {
              target: 'revealed',
              actions: 'reveal'
            },
            TOGGLE_FLAG: {
              target: 'flagged'
            }
          },
          exit: 'unreveal'
        },
        flagged: {
          on: {
            TOGGLE_FLAG: {
              target: 'unrevealed'
            }
          }
        },
        revealed: {
          on: {
            CLICK: {
              actions: 'revealNeighbors'
            }
          }
        }
      }
    },
    {
      actions: {
        reveal: pure((context: any) => {
          if (context.value === 0) {
            return sendParent({ type: 'REVEAL_NEIGHBORS', value: context.coords })
          }
          if (context.value === 'X') {
            return sendParent({ type: 'EXPLODE', value: context.coords })
          }
        }),
        revealNeighbors: sendParent((context: any) => ({ type: 'REVEAL_NEIGHBORS', value: context.coords })),
        unreveal: sendParent((context: any) => ({ type: 'UNREVEAL', value: context.coords }))
      }
    }
  )

const Cell = ({ service }: { service: any }) => {
  const [current, send]: [any, any] = useActor(service)
  const colorHash = [
    'text-blue-500',
    'text-green-500',
    'text-red-500',
    'text-orange-500',
    'text-purple-500',
    'text-yellow-500',
    'text-pink-500',
    'text-indigo-500',
    'text-teal-500'
  ]
  const isBomb = current.context.value === 'X'
  const isZero = current.context.value === 0
  const color = !isZero && !isBomb ? colorHash[current.context.value - 1] : ''
  return (
    <button
      onClick={() => send('CLICK')}
      onContextMenu={e => {
        e.preventDefault()
        send('TOGGLE_FLAG')
      }}
      className={
        ' font-bold border border-gray-200  h-12 w-12 ' +
        (current.matches('revealed') ? 'bg-gray-100 ' : 'bg-gray-300 ') +
        color
      }
    >
      {current.matches('revealed')
        ? isBomb
          ? '💣'
          : isZero
          ? ''
          : current.context.value
        : current.matches('flagged')
        ? '🚩'
        : ''}
    </button>
  )
}

export default Cell
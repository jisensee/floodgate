import { FC, Fragment, PropsWithChildren } from 'react'
import { Wizard as WizardProvider, useWizard } from 'react-use-wizard'
import { CheckCircle, ChevronLeft, ChevronRight, Circle } from 'lucide-react'
import { Separator } from './separator'
import { Button } from './button'
import { cn } from '@/lib/utils'

export type WizardStep = {
  title: string
  completed: boolean
  nextLabel?: string
}

export type WizardProps = {
  steps: WizardStep[]
  wrapperClassName?: string
} & PropsWithChildren

export const Wizard: FC<WizardProps> = ({
  steps,
  wrapperClassName,
  children,
}) => {
  return (
    <div className='flex h-full flex-col gap-y-3'>
      <WizardProvider
        header={<Header steps={steps} />}
        footer={<Footer steps={steps} />}
        wrapper={<div className={cn('p-3', wrapperClassName)} />}
      >
        {children}
      </WizardProvider>
    </div>
  )
}

type HeaderProps = {
  steps: WizardStep[]
}
const Header: FC<HeaderProps> = ({ steps }) => {
  const { activeStep, goToStep } = useWizard()

  return (
    <div className='mb-10 flex items-center justify-center gap-x-3 px-8'>
      {steps.map((step, index) => {
        const isCompleted = step.completed && index <= activeStep
        const isActive = index === activeStep
        const canBeClicked =
          index < activeStep || isCompleted || steps[index - 1]?.completed
        return (
          <Fragment key={step.title}>
            {index > 0 && (
              <Separator
                className={cn('w-12 md:w-32', { 'bg-success': isCompleted })}
              />
            )}
            <div
              className={cn('relative', { 'cursor-pointer': canBeClicked })}
              onClick={canBeClicked ? () => goToStep(index) : undefined}
            >
              {isCompleted ? (
                <CheckCircle
                  size={32}
                  className={cn({ 'text-success': isCompleted })}
                />
              ) : (
                <Circle size={32} />
              )}
              <div
                className={cn(
                  'absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap text-sm text-muted-foreground',
                  { 'text-md font-bold': isActive }
                )}
              >
                {step.title}
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

type FooterProps = {
  steps: WizardStep[]
}
const Footer: FC<FooterProps> = ({ steps }) => {
  const { isFirstStep, isLastStep, nextStep, previousStep, activeStep } =
    useWizard()
  const step = steps[activeStep]
  const nextLabel = step?.nextLabel ?? 'Next'
  const completed = step?.completed

  return (
    <div className='flex w-full justify-between'>
      <Button
        className={cn({ invisible: isFirstStep })}
        onClick={previousStep}
        size='sm'
        variant='outline'
      >
        <ChevronLeft />
        Back
      </Button>
      {!isLastStep && (
        <Button onClick={nextStep} size='sm' disabled={!completed}>
          {nextLabel}
          <ChevronRight />
        </Button>
      )}
    </div>
  )
}

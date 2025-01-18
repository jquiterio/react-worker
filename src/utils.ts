import job from "./job"

export const remoteDepsParser = (deps: string[]): string => {
  if (deps.length === 0) return ''

  const depsString = deps.map((dep) => `'${dep}'`).toString()
  return `importScripts(${depsString})`
}

export const genUrls = (
  fn: Function,
  deps: string[],
  transferable: boolean
) => {
  const blobCode = `
      ${remoteDepsParser(deps)};
      onmessage=(${job.toString()})({
        fn: (${fn}),
        transferable: '${transferable ? 'auto' : 'none'}'
      })
    `
  const blob = new Blob([blobCode], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  return url
}
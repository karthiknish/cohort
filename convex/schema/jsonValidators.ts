import { v } from 'convex/values'

export const jsonScalarValidator = v.union(v.null(), v.boolean(), v.number(), v.string())
export const jsonLayer1Validator = v.union(
  jsonScalarValidator,
  v.array(jsonScalarValidator),
  v.record(v.string(), jsonScalarValidator)
)
export const jsonLayer2Validator = v.union(
  jsonLayer1Validator,
  v.array(jsonLayer1Validator),
  v.record(v.string(), jsonLayer1Validator)
)
export const jsonLayer3Validator = v.union(
  jsonLayer2Validator,
  v.array(jsonLayer2Validator),
  v.record(v.string(), jsonLayer2Validator)
)
export const jsonRecordValidator = v.record(v.string(), jsonLayer2Validator)
export const jsonDeepRecordValidator = v.record(v.string(), jsonLayer3Validator)
export const jsonDeepArrayValidator = v.array(jsonLayer3Validator)
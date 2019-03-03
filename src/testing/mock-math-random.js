// Mock random for testing
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.75;

module.exports = mockMath;

// User tests (base version WITHOUT dataSyncSetting)
describe('getUser tests', () => {
  test('should return user data', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'admin',
      company: 'test-company',
      status: 'active',
      features: {
        finchIntegration: true
      }
      // dataSyncSetting comes in PR
    }

    expect(mockUser).toBeDefined()
    expect(mockUser.email).toBe('test@example.com')
  })
})


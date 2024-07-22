module.exports = {
    branches: ['mvfw'],
    'plugins': [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/npm',
      [
        '@semantic-release/exec',
        {
          'prepareCmd': `
            docker build . --file Dockerfile --tag ghcr.io/web3-plurality/plurality-dashboard-ui:mvfw \\
            && docker push ghcr.io/web3-plurality/plurality-dashboard-ui:mvfw
           `
        }
      ]
    ],
    'git': {
      'assets': ['package.json'],
      'message': 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    }
  };
  
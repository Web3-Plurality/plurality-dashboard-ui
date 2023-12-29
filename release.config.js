module.exports = {
    branches: ['main'],
    'plugins': [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/npm',
      [
        '@semantic-release/exec',
        {
          'prepareCmd': `
            docker build . --file Dockerfile --tag ghcr.io/web3-plurality/plurality-dashboard-ui:latest \\
            && docker push ghcr.io/web3-plurality/plurality-dashboard-ui:latest \\
            && docker tag ghcr.io/web3-plurality/plurality-dashboard-ui:latest ghcr.io/web3-plurality/plurality-dashboard-ui:\${nextRelease.version} \\
            && docker push ghcr.io/web3-plurality/plurality-dashboard-ui:\${nextRelease.version}
           `
        }
      ],
      '@semantic-release/git',
      '@semantic-release/github'
    ],
    'git': {
      'assets': ['package.json'],
      'message': 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    }
  };
  
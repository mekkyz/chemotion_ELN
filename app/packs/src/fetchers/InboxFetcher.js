export default class InboxFetcher {
  static fetchInbox(isCntOnly = false, queryParams = {}) {
    const promise = fetch(`/api/v1/inbox?cnt_only=${isCntOnly}&page=${queryParams.currentPage || 1}&per_page=${queryParams.itemsPerPage || 3}`, {
      credentials: 'same-origin'
    })
      .then(response => response.json())
      .then(json => json)
      .catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static fetchInboxByContainer(container) {
    const promise = fetch(`/api/v1/inbox/containers/id?id=${container.id}`, {
      credentials: 'same-origin'
    })
      .then(response => response.json())
      .then(json => json)
      .catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static fetchMatchingSamples(searchString) {
    const promise = fetch(`/api/v1/inbox/samples?search_string=${searchString}`, {
      credentials: 'same-origin'
    })
      .then(response => response.json())
      .then(json => json)
      .catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }

  static assignToAnalysis(attachmentId, sampleId) {
    const promise = fetch(`/api/v1/inbox/samples/${attachmentId}?attachment_id=${sampleId}`, {
      credentials: 'same-origin',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(json => json)
      .catch((errorMessage) => {
        console.log(errorMessage);
      });

    return promise;
  }
}

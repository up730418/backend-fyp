function addQuote(quote) {
  const newDiv = document.createElement('div');
  const divText = document.createTextNode(`${quote.quote} \n - ${quote.user}, ${quote.timeStamp}`);
  newDiv.appendChild(divText);
  // newDiv.style.backgroundColor = "red";
  newDiv.classList.add('quote');

  document.getElementById('quoteContainer').appendChild(newDiv);
}


window.addEventListener('load', () => {
  addQuote({ quote: 'Dumb blond alert.', user: 'Rob Wheelhouse', timeStamp: '07/11/2017' });
  addQuote({ quote: 'She can eat the meat as well.', user: 'Rob Stow', timeStamp: '12/11/2017' });
  addQuote({ quote: "It's always the female kids that get didled.", user: 'Joe M', timeStamp: '12/11/2017' });
  addQuote({ quote: "That's not what I said. What I said was: It's always the female kids are like 'ahh I've been raped'.", user: 'Joe M', timeStamp: '12/11/2017' });
  addQuote({ quote: 'brulkianr', user: 'James', timeStamp: '20/11/2017' });
  addQuote({ quote: 'Were not bringing captain creep', user: 'Anon', timeStamp: '02/12/2017' });
});

(async () => {
  const headers = {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    cookie:
      /* O QUE ME QUEBRA, AFFS :/ */
      "_normandy_session=Fh1jV7yNT0dYAClZ0MLylg+gQ07nRfCYW8gqs2GOKzfdBpOvlbb_n52X-6bOPiusMq5dlICBxwrinHPhQRcIZhMoC2tkcq5bSxY1arqwYFpOIYEacDfE4oyOXet0jTsIPb_azJbUBsMKv3yYqbUvRdBMPgtHkfKiD-lGTu2CC3LtYqXkwm9Y7aMSqi7sIh1qkWwn_P-jwSYzsDl-GDxRbm70Lmpza3RsrrgR9Y-iHuQ-7SVEgvb6-iIF9uJJY8yv6CM9ldXiziqwSYeHjaJMXjuqaeKDaKGW7h2IAnCVcJb8yZAdngM7SvNFaYUUekHAtESx5yMTa-tIhv001qR-ZAOX5rJpvMMfqX53dblMaAJlh6wcvnzUakJq0A8mAka5H5hj5zDmrbIHW0lLHUfsk7e4lv5SrYwiv2g6j4B9WDCuA9oQ3KCzfsv6MNDt3_2JdUSRtu0c_z7f-dic3yJ6QLXsid_L4xCM__7BFYGVLOM3DiiER0tSU4UdnPeebEt1eyfX7sonLUSEEGYrxMugVN_Q5LuuYxsfYei9yF2x6Uc-bh9K4-DubClEPchmh1fNq7vhwBIS_U1mhJxyxi9WOJ9.vtrHmwjgMnD6grIlaZNdpkkDTgw.YqHt-Q;",
  };

  const csvRequestNumber = await fetch(
    "https://alunos2.kenzie.com.br/courses/98/gradebook_csv",
    {
      headers: headers,
    }
  )
    .then((response) => response.text())
    .then((response) => JSON.parse(response.split(";")[1]))
    .then((response) => response.attachment_id)
    .catch((err) => console.log(err));

  const csvResponse = new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      console.log(
        `https://alunos2.kenzie.com.br/users/4747/files/${csvRequestNumber}?download=1&amp`
      );
      await fetch(
        `https://alunos2.kenzie.com.br/users/4747/files/${csvRequestNumber}?download=1&amp`,
        {
          headers: headers,
        }
      )
        .then((response) => response.text())
        .then((response) => csvToArray(response))
        .then((response) => resolve(response))
        .catch((err) => reject(err));
    }, 10000);
  });

  console.log(await csvResponse);
})();

function csvToArray(str, delimiter = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

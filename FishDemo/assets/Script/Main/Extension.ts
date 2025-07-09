declare global
{
    interface Number
    {
        /**
         * 千分位轉換
         * @param decimal 小數點顯示位數
         */
        ThousandNumberConvert( decimal: number ): string;


    }
}
Number.prototype.ThousandNumberConvert = function ( decimal: number = 0 ): string
{
    let numbers: number | string;
    numbers = typeof this === 'number' ? this.toFixed( decimal ) : Number( this ).toFixed( decimal );
    numbers = Number( this ).toString().indexOf( '.' ) < 0 ? numbers + '.' : numbers;
    let newNumber = numbers.toString().replace( /(\d)(?=(\d{3})+\.)/g, '$1,' ).replace( /\.$/, '' );

    return newNumber;
}
export { }
